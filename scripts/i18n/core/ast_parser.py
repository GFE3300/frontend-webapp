import logging
from pathlib import Path
from typing import Dict, Tuple, List, Any, Set
import json # Used for properly escaping strings in comments
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
    confirmation_prompt: callable, # New parameter
    file_path: Path # New parameter for better error messages
):
    """Helper to process a found string, add it to new_strings, and queue a rewrite."""
    string_value = node.value
    if not string_value or not string_value.strip() or 'i18n.t(' in string_value:
        return

    # Use a regex to find single-brace patterns like {word}
    single_brace_match = re.search(r"\{(\w+)\}", string_value)
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
            return # Skip this string entirely

    if string_value in value_to_key_map:
        # De-duplication: this string value already has a key
        final_key = value_to_key_map[string_value]
        if string_value not in duplicate_report:
            duplicate_report[string_value] = {'key': final_key, 'locations': [final_key]}
        if i18n_key not in duplicate_report[string_value]['locations']:
             duplicate_report[string_value]['locations'].append(i18n_key)
    else:
        # New string
        final_key = i18n_key
        value_to_key_map[string_value] = final_key
        new_strings[final_key] = string_value

    escaped_comment = json.dumps(string_value)
    replacement_text = f"i18n.t('{final_key}'), // {escaped_comment}"
    rewriter.add_replacement(node.range[0], node.range[1], replacement_text)

def _is_pluralization_node(node: Any) -> bool:
    """Checks if an AST node represents a `{ one: '...', other: '...' }` object."""
    if not node or node.type != 'ObjectExpression' or len(node.properties) != 2:
        return False
    
    keys = set()
    for prop in node.properties:
        if prop.value.type != 'Literal' or not isinstance(prop.value.value, str):
            return False # Both values must be string literals
        prop_key = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
        keys.add(prop_key)
        
    return keys == {'one', 'other'}

def _traverse_and_extract(
    node: Any,
    key_path_parts: List[str],
    rewriter: _Rewriter,
    value_to_key_map: Dict[str, str],
    new_strings: Dict[str, str],
    duplicate_report: Dict[str, Dict]
):
    """Recursively traverses the AST, identifies string literals, and queues them for replacement."""
    if not node:
        return

    node_type = getattr(node, 'type', None)

    # <<< NEW LOGIC for Pluralization >>>
    if _is_pluralization_node(node):
        base_key = ".".join(key_path_parts)
        logging.info(f"  Found pluralization block for base key: {base_key}")
        
        for prop in node.properties:
            prop_key_name = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
            plural_key = f"{base_key}_{prop_key_name}" # e.g., key.path_one, key.path_other
            
            string_value = prop.value.value
            
            # Add to new strings using the same de-duplication logic
            if string_value in value_to_key_map:
                # This string already exists, but we don't rewrite this file, so we just log it.
                pass
            else:
                # It's a new string, add it to our lists for processing.
                value_to_key_map[string_value] = plural_key
                new_strings[plural_key] = string_value
        
        # IMPORTANT: We do not traverse deeper or rewrite this node.
        # It must remain as a plain object in the source file.
        return

    if node_type == 'ObjectExpression':
        for prop in getattr(node, 'properties', []):
            if getattr(prop, 'type') == 'Property':
                prop_key = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
                if prop_key is not None:
                    _traverse_and_extract(
                        prop.value,
                        key_path_parts + [str(prop_key)],
                        rewriter,
                        value_to_key_map,
                        new_strings,
                        duplicate_report
                    )
    elif node_type == 'ArrayExpression':
        for i, element in enumerate(getattr(node, 'elements', [])):
            _traverse_and_extract(
                element,
                key_path_parts + [str(i)],
                rewriter,
                value_to_key_map,
                new_strings,
                duplicate_report
            )
    elif node_type == 'Literal' and isinstance(getattr(node, 'value', None), str):
        i18n_key = ".".join(key_path_parts)
        # The confirmation prompt functionality is part of the `extract_and_rewrite` context,
        # but this function is not the main entry point for that. The prompt should be passed down
        # or handled at a higher level. For now, assuming it's not directly used here.
        # This part of the code is not being refactored in this step.
        _process_string_literal(
            node, i18n_key, rewriter, value_to_key_map, new_strings, duplicate_report,
            lambda m: True, Path('.') # Dummy prompt and path
        )


def extract_and_rewrite(
    source_code: str,
    file_path: Path,
    project_root: Path,
    value_to_key_map: Dict[str, str],
    duplicate_report: Dict[str, Dict]
) -> Tuple[str, Dict[str, str]]:
    """Parses JS source, extracts new strings, and returns the rewritten code as a static object."""
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
                        init_node,
                        base_key_path,
                        rewriter,
                        value_to_key_map,
                        new_strings,
                        duplicate_report
                    )

    rewritten_code = rewriter.apply()
    return rewritten_code, new_strings


def find_translation_keys(source_code: str) -> Set[str]:
    """
    Parses JS source and returns a set of all translation keys used.
    This includes simple `i18n.t('key')` calls and base keys for pluralization blocks.
    """
    keys: Set[str] = set()
    try:
        # We need location info to build the key path for plurals
        ast = esprima.parseModule(source_code, {'loc': True})

        def _find_keys_recursive(node, key_path_parts=[]):
            if not node or not isinstance(node, esprima.nodes.Node):
                return

            # Case 1: Standard i18n.t('key') call
            if (node.type == 'CallExpression' and
                getattr(node.callee, 'type', '') == 'MemberExpression' and
                getattr(node.callee.object, 'name', '') == 'i18n' and
                getattr(node.callee.property, 'name', '') == 't' and
                node.arguments and node.arguments[0].type == 'Literal'):
                keys.add(node.arguments[0].value)
                # Don't recurse into arguments of t() call
                return

            # Case 2: Pluralization object { one: "...", other: "..." }
            if _is_pluralization_node(node):
                # The "key" is the path leading to this object.
                # i18next uses this base key to find _one and _other variations.
                base_key = ".".join(key_path_parts)
                keys.add(base_key)
                # We found a plural block, no need to go deeper.
                return

            # Generic traversal to build key paths for pluralization
            if node.type == 'ObjectExpression':
                for prop in getattr(node, 'properties', []):
                    if getattr(prop, 'type') == 'Property':
                        prop_key = getattr(prop.key, 'name', None) or getattr(prop.key, 'value', None)
                        if prop_key is not None:
                            _find_keys_recursive(prop.value, key_path_parts + [str(prop_key)])
            
            # Recurse into other node types that can contain objects
            elif node.type == 'ExportNamedDeclaration':
                 _find_keys_recursive(node.declaration, key_path_parts)
            elif node.type == 'VariableDeclaration':
                for var_declarator in node.declarations:
                    # Start a new key path from the variable name
                    var_name = var_declarator.id.name
                    object_root_key = _get_object_root_key(var_name)
                    # This logic assumes a single feature per file for simplicity in this context.
                    # A more complex key gen would be needed if multiple features are in one file.
                    # For now, this covers our use case.
                    _find_keys_recursive(var_declarator.init, [object_root_key] if object_root_key else [])


        # Start traversal from the top level of the module body
        for node in ast.body:
             _find_keys_recursive(node)

    except Exception as e:
        logging.warning(f"Could not parse AST to find keys, file might be malformed. Error: {e}")
        
    # Filter out any keys that might have been added incorrectly (e.g., empty strings)
    return {k for k in keys if k}


def format_comments(source_code: str, translations: Dict[str, str]) -> str:
    """
    Parses JS source and adds/updates inline comments for `i18n.t()` calls using
    an AST and token information for robust placement. This version uses line comments (//).
    """
    rewriter = _Rewriter(source_code)
    try:
        # We need tokens and comments for this robust approach
        ast = esprima.parseModule(
            source_code, 
            {'range': True, 'loc': True, 'tokens': True, 'comment': True}
        )
    except Exception as e:
        logging.warning(f"Could not parse AST for formatting, skipping file. Error: {e}")
        return source_code

    # Create a map from a token's end position to its index for quick lookups
    token_end_map = {token.range[1]: i for i, token in enumerate(ast.tokens)}

    def visit_and_format(node):
        """A visitor function to find i18n.t calls and queue comment rewrites."""
        if not node or not isinstance(node, esprima.nodes.Node):
            return

        # The target: i18n.t('some.key')
        if (node.type == 'CallExpression' and
            getattr(node.callee, 'type', '') == 'MemberExpression' and
            getattr(node.callee.object, 'name', '') == 'i18n' and
            getattr(node.callee.property, 'name', '') == 't' and
            node.arguments and node.arguments[0].type == 'Literal'):

            key = node.arguments[0].value
            translation = translations.get(key)

            if translation:
                # Use line comments for simplicity and consistency
                new_comment = f'// {json.dumps(translation)}'
                
                # Find the closing parenthesis token of the i18n.t() call
                call_end_pos = node.range[1]
                if call_end_pos not in token_end_map:
                    return # Should not happen with valid JS, but a good safeguard

                token_idx = token_end_map[call_end_pos]
                
                next_token = None
                if token_idx + 1 < len(ast.tokens):
                    next_token = ast.tokens[token_idx + 1]

                # Check if the next token is a comment on the same line
                if (next_token and 
                    next_token.type in ('LineComment', 'BlockComment') and 
                    next_token.loc.start.line == node.loc.end.line):
                    # It's a comment on the same line. Replace it.
                    # Add a leading space to separate it from the call/comma.
                    rewriter.add_replacement(next_token.range[0], next_token.range[1], f' {new_comment}')
                else:
                    # No comment found on the same line. Insert a new one at the end of the line.
                    end_of_line_pos = source_code.find('\n', call_end_pos)
                    insertion_pos = len(source_code) if end_of_line_pos == -1 else end_of_line_pos
                    
                    # Add a leading space for padding
                    rewriter.add_replacement(insertion_pos, insertion_pos, f' {new_comment}')

            # We've handled this i18n.t() call, no need to recurse into its children.
            return

        # Standard recursion for all other nodes
        for key in dir(node):
            if not key.startswith('_'):
                child = getattr(node, key)
                if isinstance(child, esprima.nodes.Node):
                    visit_and_format(child)
                elif isinstance(child, list):
                    for item in child:
                        visit_and_format(item)

    visit_and_format(ast)
    return rewriter.apply()