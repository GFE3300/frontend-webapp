import logging
from pathlib import Path
from typing import Dict, Tuple, List, Any
import json # Used for properly escaping strings in comments

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
    """
    Extracts a feature name from a file path.
    Example: 'src/features/venue_management/utils/...' -> 'venue_management'
    """
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
    """
    Transforms a JS variable name into a flatter key for the JSON structure.
    Example: 'scriptLines_Steps' -> 'steps'
    """
    prefix = 'scriptLines_'
    if var_name.startswith(prefix):
        key_part = var_name[len(prefix):]
        return key_part[0].lower() + key_part[1:] if key_part else ''
    if var_name == 'scriptLines':
        return ''
    return var_name

def _traverse_and_extract(
    node: Any,
    key_path_parts: List[str],
    rewriter: _Rewriter,
    value_to_key_map: Dict[str, str],
    new_strings: Dict[str, str],
    duplicate_report: Dict[str, Dict]
):
    """
    Recursively traverses the AST, identifies string literals, and queues them
    for replacement.
    """
    if not node:
        return

    node_type = getattr(node, 'type', None)

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
        string_value = node.value
        # Ignore empty strings or strings that are already function calls
        if not string_value or not string_value.strip() or 'i18n.t(' in string_value:
            return

        i18n_key = ".".join(key_path_parts)
        
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

        # <<< FIX: Generate direct i18n.t() call with an inline comment.
        escaped_comment = json.dumps(string_value)
        replacement_text = f"i18n.t('{final_key}'), // {escaped_comment}"
        
        # Replace the original literal with the new function call and comment.
        # This approach is simple; a code formatter like Prettier would clean up the final alignment.
        rewriter.add_replacement(node.range[0], node.range[1], replacement_text)


def extract_and_rewrite(
    source_code: str,
    file_path: Path,
    project_root: Path,
    value_to_key_map: Dict[str, str],
    duplicate_report: Dict[str, Dict]
) -> Tuple[str, Dict[str, str]]:
    """
    Parses JS source, extracts new strings, and returns the rewritten code
    as a static object.
    """
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
                    
                    # <<< FIX: No longer wrapping in a function.
                    # We just traverse the existing object.
                    
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