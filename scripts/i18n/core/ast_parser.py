import logging
from pathlib import Path
from typing import Dict, Tuple, List, Any, Set
import json
import re

try:
    import esprima
except ImportError:
    logging.critical("Esprima-python library not found. Please run 'pip install esprima-python'.")
    exit(1)

class _Rewriter:
    """A helper class to manage source code replacements without index-shifting issues."""
    def __init__(self, source_code: str):
        self.source = source_code
        self.replacements: List[Tuple[int, int, str]] = []

    def add_replacement(self, start: int, end: int, new_text: str):
        """Queues a replacement of a code slice."""
        self.replacements.append((start, end, new_text))

    def apply(self) -> str:
        """Applies all queued replacements in reverse order to avoid index shifting."""
        self.replacements.sort(key=lambda r: r[0], reverse=True)
        source_list = list(self.source)
        for start, end, new_text in self.replacements:
            source_list[start:end] = new_text
        return "".join(source_list)

def _get_feature_name(file_path: Path) -> str:
    parts = file_path.parts
    if 'features' in parts:
        try:
            features_index = parts.index('features')
            if features_index + 1 < len(parts):
                return parts[features_index + 1]
        except (ValueError, IndexError):
            pass
    return file_path.parent.name

def _get_object_root_key(var_name: str) -> str:
    prefix = 'scriptLines_'
    if var_name.startswith(prefix):
        key_part = var_name[len(prefix):]
        return key_part[0].lower() + key_part[1:] if key_part else ''
    if var_name == 'scriptLines':
        return ''
    return var_name

def _process_string_literal(
    node: Any,
    i18n_key: str,
    rewriter: _Rewriter,
    value_to_key_map: Dict[str, str],
    new_strings: Dict[str, str],
    duplicate_report: Dict[str, Dict],
    confirmation_prompt: callable,
    file_path: Path
):
    """Helper to process a found string, add it to new_strings, and queue a rewrite."""
    string_value = node.value
    if not string_value or not string_value.strip() or 'i18n.t(' in string_value:
        return

    single_brace_match = re.search(r"(?<!\{)\{(\w+)\}(?!\})", string_value)
    if single_brace_match:
        placeholder = single_brace_match.group(0)
        message = (
            f"WARNING: The string \"{string_value}\" in {file_path.name}\n"
            f"contains a placeholder-like pattern \"{placeholder}\". Our convention for dynamic values\n"
            f"is double-braces (e.g., '{{{{count}}}}') to work correctly with our translation service.\n"
            f"Is this string correct as-is and not a dynamic placeholder?"
        )
        if not confirmation_prompt(message):
            logging.warning(f"Skipping string. Please fix the placeholder format in '{file_path}' and re-run.")
            return

    if string_value in value_to_key_map:
        final_key = value_to_key_map[string_value]
        if string_value not in duplicate_report:
            duplicate_report[string_value] = {'key': final_key, 'locations': [final_key]}
        if i18n_key not in duplicate_report[string_value]['locations']:
             duplicate_report[string_value]['locations'].append(i18n_key)
    else:
        final_key = i18n_key
        value_to_key_map[string_value] = final_key
        new_strings[final_key] = string_value

    # The `sync` command ONLY transforms code. It does not add comments.
    # That is the exclusive job of the `format` command.
    replacement_text = f"i18n.t('{final_key}')"
    rewriter.add_replacement(node.range[0], node.range[1], replacement_text)

def _is_pluralization_node(node: Any) -> bool:
    """Checks if an AST node represents a `{ one: '...', other: '...' }` object."""
    if not node or node.type != 'ObjectExpression' or len(node.properties) != 2:
        return False
    
    keys = set()
    for prop in node.properties:
        if prop.value.type != 'Literal' or not isinstance(prop.value.value, str):
            return False
        prop_key = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
        keys.add(prop_key)
        
    return keys == {'one', 'other'}

def _traverse_and_extract(
    node: Any,
    key_path_parts: List[str],
    rewriter: _Rewriter,
    value_to_key_map: Dict[str, str],
    new_strings: Dict[str, str],
    duplicate_report: Dict[str, Dict],
    confirmation_prompt: callable,
    file_path: Path
):
    """Recursively traverses the AST, identifies strings AND legacy t() calls, and queues them for replacement."""
    if not node:
        return

    node_type = getattr(node, 'type', None)
    
    # NEW: Detect and upgrade legacy `t('key')` calls to `i18n.t('key')`
    if node_type == 'CallExpression' and getattr(node.callee, 'name', '') == 't':
        original_text = rewriter.source[node.range[0]:node.range[1]]
        replacement_text = f"i18n.{original_text}"
        rewriter.add_replacement(node.range[0], node.range[1], replacement_text)
        return # Handled this node, no need to traverse its children

    if _is_pluralization_node(node):
        base_key = ".".join(key_path_parts)
        logging.info(f"  Found pluralization block for base key: {base_key}")
        
        # 1. Extract the plural variations for the translation.json file
        for prop in node.properties:
            prop_key_name = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
            plural_key = f"{base_key}_{prop_key_name}" # e.g., key.path_one
            string_value = prop.value.value
            
            # Check for incorrect placeholder format
            single_brace_match = re.search(r"(?<!\{)\{(\w+)\}(?!\})", string_value)
            if single_brace_match and not confirmation_prompt(f"Warning: Plural string '{string_value}' in {file_path.name} uses single braces. Our convention is double braces '{{{{variable}}}}'. Is this intentional?"):
                logging.warning(f"Skipping plural string '{string_value}' due to incorrect format. Please fix and re-run.")
                continue

            if string_value not in value_to_key_map:
                value_to_key_map[string_value] = plural_key
                new_strings[plural_key] = string_value
        
        # 2. Rewrite the entire block to use the base key
        # This makes the script_lines file consistent.
        replacement_text = f"i18n.t('{base_key}')"
        rewriter.add_replacement(node.range[0], node.range[1], replacement_text)
        
        return

    if node_type == 'ObjectExpression':
        for prop in getattr(node, 'properties', []):
            if getattr(prop, 'type') == 'Property':
                prop_key = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
                if prop_key is not None:
                    _traverse_and_extract(
                        prop.value, key_path_parts + [str(prop_key)], rewriter,
                        value_to_key_map, new_strings, duplicate_report,
                        confirmation_prompt, file_path
                    )
    elif node_type == 'ArrayExpression':
        for i, element in enumerate(getattr(node, 'elements', [])):
            _traverse_and_extract(
                element, key_path_parts + [str(i)], rewriter,
                value_to_key_map, new_strings, duplicate_report,
                confirmation_prompt, file_path
            )
    elif node_type == 'Literal' and isinstance(getattr(node, 'value', None), str):
        i18n_key = ".".join(key_path_parts)
        _process_string_literal(
            node, i18n_key, rewriter, value_to_key_map, new_strings, duplicate_report,
            confirmation_prompt, file_path
        )

def extract_and_rewrite(
    source_code: str,
    file_path: Path,
    project_root: Path,
    value_to_key_map: Dict[str, str],
    duplicate_report: Dict[str, Dict],
    confirmation_prompt: callable
) -> Tuple[str, Dict[str, str]]:
    """Parses JS source, extracts new strings, and returns the rewritten code."""
    rewriter = _Rewriter(source_code)
    new_strings: Dict[str, str] = {}
    try:
        ast = esprima.parseModule(source_code, {'range': True, 'loc': True})
    except Exception as e:
        logging.error(f"Failed to parse AST for {file_path}: {e}")
        return source_code, {}

    for node in ast.body:
        if getattr(node, 'type') == 'ExportNamedDeclaration':
            declaration = getattr(node, 'declaration', None)
            if declaration and getattr(declaration, 'type') == 'VariableDeclaration':
                for var_declarator in declaration.declarations:
                    var_name = var_declarator.id.name
                    init_node = var_declarator.init
                    relative_file_path = file_path.relative_to(project_root)
                    feature_name = _get_feature_name(relative_file_path)
                    object_root_key = _get_object_root_key(var_name)
                    base_key_path = [p for p in [feature_name, object_root_key] if p]
                    _traverse_and_extract(
                        init_node, base_key_path, rewriter, value_to_key_map,
                        new_strings, duplicate_report, confirmation_prompt, file_path
                    )

    rewritten_code = rewriter.apply()
    return rewritten_code, new_strings

# scripts/i18n/core/ast_parser.py

# ... (keep existing code until line 226)

def find_translation_keys(source_code: str) -> Set[str]:
    """
    Parses JS source and returns a set of all translation keys used.
    """
    keys: Set[str] = set()
    try:
        ast = esprima.parseModule(source_code, {'loc': True})

        def _find_keys_recursive(node, key_path_parts=[]):
            if not node or not isinstance(node, esprima.nodes.Node):
                return

            if (node.type == 'CallExpression' and
                getattr(node.callee, 'type', '') == 'MemberExpression' and
                getattr(node.callee.object, 'name', '') == 'i18n' and
                getattr(node.callee.property, 'name', '') == 't' and
                node.arguments and node.arguments[0].type == 'Literal'):
                keys.add(node.arguments[0].value)
                return

            if _is_pluralization_node(node):
                base_key = ".".join(key_path_parts)
                keys.add(base_key)
                return

            if node.type == 'ObjectExpression':
                for prop in getattr(node, 'properties', []):
                    if getattr(prop, 'type') == 'Property':
                        prop_key = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
                        if prop_key is not None:
                            _find_keys_recursive(prop.value, key_path_parts + [str(prop_key)])
            
            elif node.type == 'ArrayExpression':
                for i, element in enumerate(getattr(node, 'elements', [])):
                    _find_keys_recursive(element, key_path_parts + [str(i)])

            elif node.type == 'ExportNamedDeclaration':
                 _find_keys_recursive(node.declaration, key_path_parts)
            elif node.type == 'VariableDeclaration':
                for var_declarator in node.declarations:
                    var_name = var_declarator.id.name
                    object_root_key = _get_object_root_key(var_name)
                    _find_keys_recursive(var_declarator.init, [object_root_key] if object_root_key else [])

        for node in ast.body:
             _find_keys_recursive(node)

    except Exception as e:
        logging.warning(f"Could not parse AST to find keys in file, it might be malformed. Error: {e}")

    return {k for k in keys if k}

def format_comments(source_code: str, translations: Dict[str, str], file_path_for_logging: Path = None) -> str:
    """
    Parses JS source and adds/updates inline comments for `i18n.t()` calls using
    a robust regular expression to handle idempotency.
    """
    # This regex captures the line content up to and including the i18n.t() call,
    # and optionally consumes any existing line comment.
    line_regex = re.compile(
        # Group 1: Capture the entire line content up to the end of the i18n call
        r"^(.*\bi18n\.t\('([^']+)'\).*?)"
        # Optional non-capturing group for an existing comment to be replaced
        r"(?:\s*\/\/.*)?$",
        re.MULTILINE
    )

    def replacer(match):
        # The content of the line before any comment
        line_content = match.group(1).rstrip()
        # The i18n key
        key = match.group(2)

        translation = translations.get(key)
        
        # If the key has a valid translation, reconstruct the line with the new, correct comment.
        if translation:
            escaped_comment = json.dumps(translation)
            return f"{line_content} // {escaped_comment}"
        else:
            # If for some reason the key has no translation,
            # just return the line content without any comment.
            return line_content

    return line_regex.sub(replacer, source_code)