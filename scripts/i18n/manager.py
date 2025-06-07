import argparse
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path

# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

from core.state_manager import (
    get_current_state,
    load_previous_state,
    save_state,
    get_changed_files,
)
from core.ast_parser import extract_and_rewrite
from core.file_handler import (
    load_json,
    save_json,
    backup_file,
    write_file,
    read_file,
)
from core.translator import initialize_translator, translate_texts

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(message)s')
ACTUAL_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_DIR = ACTUAL_PROJECT_ROOT / "src"
SCRIPTS_DIR = Path(__file__).parent
STATE_FILE = ACTUAL_PROJECT_ROOT / ".i18n_state.json" 
BACKUP_DIR = SCRIPTS_DIR / "backups"
CONFIG_FILE = SCRIPTS_DIR / "config.json"
DEFAULT_SOURCE_LANG = "en"

# --- Helper Functions ---
# (load_app_config, save_app_config, get_translation_file_path, get_i18n_header remain unchanged)
def load_app_config():
    return load_json(CONFIG_FILE)

def save_app_config(config):
    save_json(CONFIG_FILE, config)

def get_translation_file_path(lang_code: str) -> Path:
    return SRC_DIR / "locales" / lang_code / "translation.json"

def get_i18n_header():
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    return f"""/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced {now_utc}
 */
"""

# --- Command Handlers ---
# (handle_init, handle_check, handle_clean remain unchanged)
def handle_init(args):
    """Handler for the 'init' command."""
    lang_code = args.lang_code.lower()
    config = load_app_config()
    
    if 'languages' not in config:
        config['languages'] = [DEFAULT_SOURCE_LANG]
        config['source_language'] = DEFAULT_SOURCE_LANG

    if lang_code in config['languages']:
        logging.warning(f"Language '{lang_code}' is already initialized.")
        return

    config['languages'].append(lang_code)
    save_app_config(config)
    
    translation_file = get_translation_file_path(lang_code)
    translation_file.parent.mkdir(parents=True, exist_ok=True)
    
    if not translation_file.exists():
        save_json(translation_file, {})
        logging.info(f"Created empty translation file at: {translation_file.relative_to(ACTUAL_PROJECT_ROOT)}")
        
    logging.info(f"Successfully initialized language '{lang_code}'.")

def handle_sync(args):
    """Handler for the 'sync' command."""
    logging.info("Starting synchronization process...")
    config = load_app_config()
    if not config:
        logging.error("Configuration not found. Please run 'init' first.")
        return
        
    previous_state = load_previous_state(STATE_FILE)
    current_state = get_current_state(SRC_DIR)
    files_to_process = get_changed_files(current_state, previous_state, SRC_DIR)
    
    if not files_to_process and not args.force:
        logging.info("No files have changed. Sync is complete.")
        return
    
    if args.force:
        logging.warning("--force flag is active. Reprocessing all files.")
        files_to_process = [SRC_DIR / p for p in current_state.keys()]

    source_lang = config.get('source_language', DEFAULT_SOURCE_LANG)
    source_translation_file = get_translation_file_path(source_lang)
    
    source_translations_nested = load_json(source_translation_file)
    
    def flatten_dict(d, parent_key='', sep='.'):
        items = {}
        for k, v in d.items():
            new_key = parent_key + sep + k if parent_key else k
            if isinstance(v, dict):
                items.update(flatten_dict(v, new_key, sep=sep))
            else:
                items[new_key] = v
        return items

    source_translations_flat = flatten_dict(source_translations_nested)
    value_to_key_map = {v: k for k, v in source_translations_flat.items()}
    duplicate_report = {}
    all_new_strings = {}
    
    for file_path in files_to_process:
        logging.info(f"Processing: {file_path.relative_to(ACTUAL_PROJECT_ROOT)}")
        source_code = read_file(file_path)
        if not source_code:
            continue

        rewritten_code, new_strings = extract_and_rewrite(
            source_code, file_path, SRC_DIR, value_to_key_map, duplicate_report
        )
        
        if new_strings or args.force: # Rewrite file if new strings found or forced
            all_new_strings.update(new_strings)
            
            header = get_i18n_header()
            i18n_path = (SRC_DIR / 'i18n.js').resolve()
            relative_import_path = os.path.relpath(i18n_path, file_path.parent.resolve()).replace('\\', '/').replace('.js', '')
            
            # <<< FIX: Use aliased import and correct `(t = i18n_t)` pattern
            import_statement = f"import {{ t as i18n_t }} from '{relative_import_path}';"
            final_code = f"{header}\n{import_statement}\n\n{rewritten_code}\n"
            
            if not args.dry_run:
                backup_file(file_path, BACKUP_DIR)
                write_file(file_path, final_code)
    
    if all_new_strings:
        logging.info(f"Found {len(all_new_strings)} new unique strings to add to source file.")
        
        def unflatten_dict(d):
            result = {}
            for key, value in d.items():
                parts = key.split('.')
                d_ref = result
                for part in parts[:-1]:
                    d_ref = d_ref.setdefault(part, {})
                d_ref[parts[-1]] = value
            return result

        source_translations_flat.update(all_new_strings)
        updated_source_nested = unflatten_dict(source_translations_flat)

        if not args.dry_run:
            save_json(source_translation_file, updated_source_nested)
    else:
        logging.info("No new strings found in changed files.")

    # (Translation logic remains the same)
    target_languages = [lang for lang in config['languages'] if lang != source_lang]
    if args.lang:
        target_languages = [lang for lang in args.lang if lang in target_languages]

    if target_languages and all_new_strings:
        api_key = os.getenv("DEEPL_API_KEY")
        translator = initialize_translator(api_key)
        if not translator:
            logging.error("Translation step skipped due to translator initialization failure.")
            return
            
        texts_to_translate = list(all_new_strings.values())
        keys_for_texts = list(all_new_strings.keys())
        
        for lang_code in target_languages:
            logging.info(f"\n--- Translating to {lang_code.upper()} ---")
            target_file = get_translation_file_path(lang_code)
            target_translations_nested = load_json(target_file)
            target_translations_flat = flatten_dict(target_translations_nested)
            
            translated_texts = translate_texts(translator, texts_to_translate, lang_code)
            
            if translated_texts:
                for i, key in enumerate(keys_for_texts):
                    target_translations_flat[key] = translated_texts[i]
                
                updated_target_nested = unflatten_dict(target_translations_flat)
                if not args.dry_run:
                    save_json(target_file, updated_target_nested)
            else:
                logging.warning(f"Skipping save for '{lang_code}' due to translation failure.")

    if not args.dry_run:
        save_state(STATE_FILE, current_state)
        logging.info("Synchronization process completed successfully.")
    else:
        logging.warning("DRY RUN finished. No files were written.")


def handle_refactor_components(args):
    """Handler for the 'refactor-components' command."""
    logging.info("Starting component refactoring process...")
    
    # 1. Find all relevant component files
    component_files = [
        p for p in SRC_DIR.rglob("*") 
        if p.suffix in ['.jsx', '.tsx'] and 'node_modules' not in p.parts
    ]
    logging.info(f"Found {len(component_files)} component files to analyze.")

    # 2. Define Regex patterns
    # Finds imports like: import { scriptLines, scriptLines_Steps } from '...'
    import_regex = re.compile(r"import\s+\{([^}]+)\}\s+from\s+['\"].*?/script_lines['\"]")
    
    # Finds React functional component definitions
    component_def_regex = re.compile(r"(?:export\s+)?(?:const|function)\s+([A-Z]\w*)\s*=\s*\(([^)]*)\)\s*=>\s*\{")
    
    # Check for existing useTranslation hook
    hook_import_regex = re.compile(r"useTranslation")
    hook_call_regex = re.compile(r"const\s+\{\s*t\s*\}\s*=\s*useTranslation\(\);")

    # 3. Process each file
    total_changes = 0
    for file_path in component_files:
        content = read_file(file_path)
        if not content:
            continue

        import_match = import_regex.search(content)
        if not import_match:
            continue

        # Found a file that imports from script_lines.js
        logging.info(f"Found relevant import in: {file_path.relative_to(ACTUAL_PROJECT_ROOT)}")
        
        original_content = str(content)
        modified_content = str(content)

        # a. Extract imported variable names
        imported_vars_str = import_match.group(1)
        imported_vars = [v.strip() for v in imported_vars_str.split(',')]

        # b. Add useTranslation import if missing
        if not hook_import_regex.search(modified_content):
            modified_content = re.sub(
                r"(import\s+React[^;]+;)",
                r"\1\nimport { useTranslation } from 'react-i18next';",
                modified_content,
                count=1
            )

        # c. Add useTranslation hook call if missing
        if not hook_call_regex.search(modified_content):
            # Find component definition to inject the hook
            component_match = component_def_regex.search(modified_content)
            if component_match:
                injection_point = component_match.end(0)
                indentation = "  " # Simple assumption
                hook_call = f"\n{indentation}const {{ t }} = useTranslation();"
                modified_content = modified_content[:injection_point] + hook_call + modified_content[injection_point:]
        
        # d. Rewrite all usages of the imported scriptLines objects
        for var in imported_vars:
            # This regex finds `varName.prop1.prop2` but not `varName(t)...`
            usage_regex = re.compile(rf"({re.escape(var)})(?!\s*\()")
            modified_content = usage_regex.sub(rf"\1(t)", modified_content)
            
        if original_content != modified_content:
            total_changes += 1
            if args.dry_run:
                print("-" * 80)
                print(f"DRY RUN: Proposed changes for {file_path.relative_to(ACTUAL_PROJECT_ROOT)}")
                print("-" * 80)
                # A simple diff-like view
                print("--- BEFORE ---")
                print(original_content)
                print("\n--- AFTER ---")
                print(modified_content)
                print("-" * 80 + "\n")
            else:
                logging.info(f"Refactoring component: {file_path.relative_to(ACTUAL_PROJECT_ROOT)}")
                backup_file(file_path, BACKUP_DIR)
                write_file(file_path, modified_content)

    if total_changes == 0:
        logging.info("No components needed refactoring.")
    else:
        if args.dry_run:
            logging.warning(f"DRY RUN: Found {total_changes} components that need refactoring.")
        else:
            logging.info(f"Successfully refactored {total_changes} components.")

def handle_check(args):
    """Handler for the 'check' command."""
    logging.info("Running I18N status check...")
    config = load_app_config()
    if not config:
        logging.error("Configuration not found. Please run 'init' first.")
        return

    previous_state = load_previous_state(STATE_FILE)
    current_state = get_current_state(SRC_DIR)
    changed_files = get_changed_files(current_state, previous_state, SRC_DIR)
    
    if changed_files:
        logging.warning(f"{len(changed_files)} file(s) are not in sync with the state file:")
        for f in changed_files:
            print(f"  - {f.relative_to(SRC_DIR)}")
    else:
        logging.info("All tracked files are in sync.")

def handle_clean(args):
    """Handler for the 'clean' command."""
    logging.warning("The 'clean' command is not yet implemented.")
    pass

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="I18N Workflow Manager for React projects.")
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")

    # --- Init Command ---
    parser_init = subparsers.add_parser("init", help="Initialize a new language.")
    parser_init.add_argument("lang_code", help="The language code to initialize (e.g., 'fr', 'de-DE').")
    parser_init.set_defaults(func=handle_init)

    # --- Sync Command ---
    parser_sync = subparsers.add_parser("sync", help="Synchronize strings from source code to translation files.")
    parser_sync.add_argument("--force", action="store_true", help="Force reprocessing of all source files.")
    parser_sync.add_argument("--lang", nargs='+', help="Specify target languages to translate (e.g., es fr).")
    parser_sync.add_argument("--dry-run", action="store_true", help="Simulate the process without writing any files.")
    parser_sync.set_defaults(func=handle_sync)

    # --- Refactor Components Command ---
    parser_refactor = subparsers.add_parser("refactor-components", help="Refactor React components to use the new functional script_lines pattern.")
    parser_refactor.add_argument("--dry-run", action="store_true", help="Show proposed changes without writing to files.")
    parser_refactor.set_defaults(func=handle_refactor_components)

    # --- Check Command ---
    parser_check = subparsers.add_parser("check", help="Check the status of I18N files.")
    parser_check.add_argument("--details", action="store_true", help="Show detailed status information.")
    parser_check.set_defaults(func=handle_check)

    # --- Clean Command ---
    parser_clean = subparsers.add_parser("clean", help="Remove orphaned (unused) keys from translation files.")
    parser_clean.add_argument("--yes", action="store_true", help="Skip confirmation prompt.")
    parser_clean.set_defaults(func=handle_clean)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()