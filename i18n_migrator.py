import os
import json
import argparse
import re
import shutil
from pathlib import Path
import logging

try:
    import esprima
except ImportError:
    print("\n" + "="*80)
    print("Error: 'esprima-python' is not installed.")
    print("Please install it by running: pip install esprima-python")
    print("="*80 + "\n")
    exit(1)

# --- Configuration ---
LOG_LEVEL = logging.INFO
logging.basicConfig(level=LOG_LEVEL, format='%(levelname)s: %(message)s')

# --- Global State ---
# Holds the final nested dictionary for the JSON file
translations = {}
# Maps a string value to its generated i18n key for de-duplication
value_to_key_map = {}
# Stores information about duplicated strings for reporting
duplicate_report = {}

# --- AST Traversal & Rewriting ---

class Rewriter:
    """Manages source code modifications to avoid index shifting issues."""
    def __init__(self, source_code):
        self.source = source_code
        self.replacements = []

    def add_replacement(self, start, end, new_text):
        """Queue a replacement."""
        self.replacements.append((start, end, new_text))

    def apply(self):
        """Apply all queued replacements to the source code."""
        # Sort replacements in reverse order by start index to avoid shifting
        self.replacements.sort(key=lambda r: r[0], reverse=True)
        source_list = list(self.source)
        for start, end, new_text in self.replacements:
            source_list[start:end] = new_text
        return "".join(source_list)

def get_feature_name(file_path: Path) -> str:
    """Extracts a feature name from a file path (e.g., 'src/features/x/y' -> 'x')."""
    parts = file_path.parts
    if 'features' in parts:
        try:
            features_index = parts.index('features')
            if features_index + 1 < len(parts):
                return parts[features_index + 1]
        except ValueError:
            pass
    # Fallback to the parent directory of the script file if not in 'utils'
    if file_path.parent.name != 'utils':
      return file_path.parent.name
    # Fallback to the grandparent directory if in 'utils'
    if len(file_path.parent.parts) > 1:
        return file_path.parent.parent.name
    return 'common'


def get_object_root_key(var_name: str) -> str:
    """Transforms a variable name like 'scriptLines_Steps' into a key part 'steps'."""
    if var_name == 'scriptLines':
        return ''
    if var_name.startswith('scriptLines_'):
        key_part = var_name[len('scriptLines_'):]
        # Convert first letter to lowercase (camelCase)
        return key_part[0].lower() + key_part[1:] if key_part else ''
    return var_name

def set_nested_key(d: dict, key_string: str, value):
    """Sets a value in a nested dictionary using a dot-separated key string."""
    keys = key_string.split('.')
    current_level = d
    for key in keys[:-1]:
        current_level = current_level.setdefault(key, {})
    current_level[keys[-1]] = value

def process_string_literal(node, key_path_parts, rewriter):
    """Processes a found string literal, handles de-duplication, and queues a rewrite."""
    string_value = node.value
    # Ignore empty or whitespace-only strings
    if not string_value or not string_value.strip():
        return

    i18n_key = ".".join(key_path_parts)

    if string_value in value_to_key_map:
        # This string value has been seen before. Use the existing key.
        existing_key = value_to_key_map[string_value]
        
        # Log for duplicate report
        if string_value not in duplicate_report:
            duplicate_report[string_value] = {'key': existing_key, 'locations': [existing_key]}
        if i18n_key not in duplicate_report[string_value]['locations']:
            duplicate_report[string_value]['locations'].append(i18n_key)
        
        final_key = existing_key
    else:
        # This is a new string. Create a new key and translation entry.
        final_key = i18n_key
        value_to_key_map[string_value] = final_key
        set_nested_key(translations, final_key, string_value)
    
    # Queue the replacement in the source file.
    # The range of a Literal node includes the quotes.
    start, end = node.range
    replacement_text = f"t('{final_key}')"
    rewriter.add_replacement(start, end, replacement_text)

def traverse_and_extract(node, key_path_parts, rewriter):
    """Recursively traverses the AST, looking for string literals to replace."""
    if not node:
        return

    node_type = getattr(node, 'type', None)

    if node_type == 'ObjectExpression':
        for prop in getattr(node, 'properties', []):
            if getattr(prop, 'type', None) == 'Property':
                prop_key = None
                prop_key_node = getattr(prop, 'key', None)
                if getattr(prop_key_node, 'type', None) == 'Identifier':
                    prop_key = prop_key_node.name
                elif getattr(prop_key_node, 'type', None) == 'Literal':
                    prop_key = prop_key_node.value
                
                if prop_key is not None:
                    traverse_and_extract(prop.value, key_path_parts + [str(prop_key)], rewriter)

    elif node_type == 'ArrayExpression':
        for i, element in enumerate(getattr(node, 'elements', [])):
            # We use the index as part of the key for elements in an array
            traverse_and_extract(element, key_path_parts + [str(i)], rewriter)

    elif node_type == 'Literal' and isinstance(getattr(node, 'value', None), str):
        process_string_literal(node, key_path_parts, rewriter)

    elif node_type == 'TemplateLiteral':
        # For simplicity, only handle template literals without expressions (`${...}`).
        if not getattr(node, 'expressions', []):
            # A template literal without expressions has one 'quasi'.
            quasi = node.quasis[0]
            # Create a pseudo-literal node to process.
            # The range needs to include the backticks.
            pseudo_literal_node = type('obj', (object,), {
                'value': quasi.value.cooked,
                'range': node.range
            })
            process_string_literal(pseudo_literal_node, key_path_parts, rewriter)

def process_file(file_path: Path, args):
    """Processes a single script_lines.js file."""
    logging.info(f"Processing file: {file_path}")
    try:
        source_code = file_path.read_text(encoding='utf-8')
    except Exception as e:
        logging.error(f"Could not read file {file_path}: {e}")
        return

    # Skip files that seem to already be migrated
    if "import { t }" in source_code:
        logging.warning(f"Skipping {file_path} as it appears to be already migrated (contains 'import {{ t }}').")
        return

    rewriter = Rewriter(source_code)
    try:
        # Parse the module, enabling range information for rewriting
        ast = esprima.parseModule(source_code, {'range': True})
    except Exception as e:
        logging.error(f"Could not parse AST for {file_path}: {e}")
        return

    # Find all top-level exported constants
    for node in ast.body:
        declaration_node = getattr(node, 'declaration', None)
        if (getattr(node, 'type', None) == 'ExportNamedDeclaration' and
            declaration_node and
            getattr(declaration_node, 'type', None) == 'VariableDeclaration'):
            
            for declaration in declaration_node.declarations:
                if (getattr(declaration, 'type', None) == 'VariableDeclarator' and
                    getattr(declaration, 'init', None)):
                    
                    var_name = declaration.id.name
                    feature_name = get_feature_name(file_path)
                    object_root_key = get_object_root_key(var_name)
                    
                    base_key_path = [part for part in [feature_name, object_root_key] if part]

                    logging.debug(f"  Found export '{var_name}', base key: '{'.'.join(base_key_path)}'")
                    traverse_and_extract(declaration.init, base_key_path, rewriter)

    if not rewriter.replacements:
        logging.info(f"No replaceable strings found in {file_path}. Skipping.")
        return

    modified_source = rewriter.apply()

    i18n_file = Path(args.i18n_source_file)
    relative_path = os.path.relpath(i18n_file.parent, file_path.parent)
    # Use posix path for JS imports
    import_path = (Path(relative_path) / i18n_file.stem).as_posix()
    import_statement = f"import {{ t }} from '{import_path}';\n\n"

    final_code = import_statement + modified_source

    if args.dry_run:
        print("\n" + "-" * 80)
        print(f"DRY RUN: Proposed changes for {file_path}")
        print("-" * 80)
        print(final_code)
    else:
        backup_path = file_path.with_suffix(file_path.suffix + '.bak')
        logging.info(f"Backing up original file to {backup_path}")
        shutil.copy(file_path, backup_path)
        
        logging.info(f"Rewriting file: {file_path}")
        file_path.write_text(final_code, encoding='utf-8')

def load_existing_translations(json_path: Path):
    """Loads existing translations and populates the value-to-key map for de-duplication."""
    if not json_path.exists():
        logging.info("No existing translation file found. Starting fresh.")
        return

    logging.info(f"Loading existing translations from {json_path}...")
    try:
        with json_path.open('r', encoding='utf-8') as f:
            existing_data = json.load(f)
        
        global translations
        translations = json.loads(json.dumps(existing_data))

        def flatten_and_populate(data, path_prefix=''):
            for key, value in data.items():
                full_key = f"{path_prefix}.{key}" if path_prefix else key
                if isinstance(value, dict):
                    flatten_and_populate(value, full_key)
                elif isinstance(value, str):
                    if value in value_to_key_map:
                        logging.warning(
                            f"Duplicate value found in existing JSON for key '{full_key}' "
                            f"and '{value_to_key_map[value]}'. Value: '{value[:50]}...'"
                        )
                    else:
                        value_to_key_map[value] = full_key
        
        flatten_and_populate(translations)
    except (json.JSONDecodeError, IOError) as e:
        logging.error(f"Failed to load or parse {json_path}: {e}")
        exit(1)

def sort_dict_recursively(d: dict):
    """Recursively sorts a dictionary by its keys."""
    return {k: sort_dict_recursively(v) if isinstance(v, dict) else v for k, v in sorted(d.items())}

def main():
    parser = argparse.ArgumentParser(
        description="Internationalize a React project by extracting strings from 'script_lines.js' files.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("root_dir", help="The root directory of the React project (e.g., 'src').")
    parser.add_argument(
        "--json-file",
        default="src/locales/en/translation.json",
        help="Path to the output JSON translation file."
    )
    parser.add_argument(
        "--i18n-source-file",
        default="src/i18n.js",
        help="Path to the JS/TS file that exports the 't' function, used for relative import calculation."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print proposed changes to console without writing any files."
    )
    parser.add_argument(
        "--report-duplicates",
        action="store_true",
        help="Print a report of all de-duplicated strings and their canonical key."
    )
    args = parser.parse_args()

    root_path = Path(args.root_dir)
    json_path = Path(args.json_file)

    if not root_path.is_dir():
        logging.error(f"Root directory not found: {args.root_dir}")
        exit(1)

    load_existing_translations(json_path)
    
    script_files = list(root_path.rglob('script_lines.js'))
    if not script_files:
        logging.warning("No 'script_lines.js' files found in the specified directory.")
        return
        
    for file_path in script_files:
        process_file(file_path, args)

    sorted_translations = sort_dict_recursively(translations)

    if args.dry_run:
        print("\n" + "-" * 80)
        print(f"DRY RUN: Proposed content for {json_path}")
        print("-" * 80)
        print(json.dumps(sorted_translations, indent=2, ensure_ascii=False))
    else:
        json_path.parent.mkdir(parents=True, exist_ok=True)
        logging.info(f"Writing translations to {json_path}")
        with json_path.open('w', encoding='utf-8') as f:
            json.dump(sorted_translations, f, indent=2, ensure_ascii=False)
        logging.info("Translation file updated successfully.")

    if args.report_duplicates:
        print("\n" + "=" * 80)
        print("DUPLICATE STRINGS REPORT")
        print("=" * 80)
        
        # Filter out non-duplicates for the report
        actual_duplicates = {k: v for k, v in duplicate_report.items() if len(v['locations']) > 1}

        if not actual_duplicates:
            print("No duplicate strings were found across different keys.")
        else:
            for value, info in sorted(actual_duplicates.items()):
                print(f"\nValue: \"{value}\"")
                print(f"  - Canonical Key: {info['key']}")
                print(f"  - Found at ({len(info['locations'])} locations):")
                for loc in sorted(info['locations']):
                    print(f"    - {loc}")
        print("=" * 80)

if __name__ == "__main__":
    main()