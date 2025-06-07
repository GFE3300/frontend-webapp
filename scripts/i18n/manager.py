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
from core.ast_parser import (
    extract_and_rewrite,
    find_translation_keys,
    format_comments
)
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

def flatten_dict(d, parent_key='', sep='.'):
    """Flattens a nested dictionary."""
    items = {}
    for k, v in d.items():
        new_key = parent_key + sep + k if parent_key else k
        if isinstance(v, dict):
            items.update(flatten_dict(v, new_key, sep=sep))
        else:
            items[new_key] = v
    return items

def unflatten_dict(d):
    """Unflattens a dictionary from dot-notation keys."""
    result = {}
    for key, value in d.items():
        parts = key.split('.')
        d_ref = result
        for part in parts[:-1]:
            d_ref = d_ref.setdefault(part, {})
        d_ref[parts[-1]] = value
    return result

def _prompt_for_confirmation(message: str) -> bool:
    """Prompts the user for a [y/N] confirmation and returns the result."""
    response = input(f"\n{message} [y/N] ").lower().strip()
    return response == 'y'

# --- Command Handlers ---
def handle_init(args):
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
    logging.info("Starting synchronization process...")
    config = load_app_config()
    if not config:
        logging.error("Configuration not found. Please run 'init' first.")
        return
        
    previous_state = load_previous_state(STATE_FILE)
    current_state = get_current_state(SRC_DIR)
    
    # Pass the confirmation prompt to the AST parser
    global _confirmation_prompt_func
    _confirmation_prompt_func = _prompt_for_confirmation
    
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
    source_translations_flat = flatten_dict(source_translations_nested)
    value_to_key_map = {v: k for k, v in source_translations_flat.items()}
    duplicate_report = {}
    all_new_strings = {}
    
    for file_path in files_to_process:
        logging.info(f"Processing: {file_path.relative_to(ACTUAL_PROJECT_ROOT)}")
        source_code = read_file(file_path)
        if not source_code:
            continue
        
        # We need to update extract_and_rewrite to accept the prompt function
        # For now, let's assume a simplified call, as the focus is on format and clean
        rewritten_code, new_strings = extract_and_rewrite(
            source_code, file_path, SRC_DIR, value_to_key_map, duplicate_report
        )
        
        if new_strings or (args.force and rewritten_code != source_code):
            all_new_strings.update(new_strings)
            header = get_i18n_header()
            
            # This logic for import calculation needs to be more robust
            try:
                i18n_path_obj = (SRC_DIR / 'i18n.js').resolve()
                relative_import_path = os.path.relpath(i18n_path_obj, file_path.parent.resolve()).replace('\\', '/').replace('.js', '')
            except ValueError:
                # Fallback for different drives on Windows
                relative_import_path = '../../../i18n'

            import_statement = f"import i18n from '{relative_import_path}';"
            
            # Remove any old auto-managed headers before adding a new one
            source_code_no_header = re.sub(r'/\*\*[\s\S]*?@auto-managed[\s\S]*?\*/\n*', '', rewritten_code, 1)
            
            final_code = f"{header}\n{import_statement}\n\n{source_code_no_header.strip()}\n"
            
            if not args.dry_run:
                backup_file(file_path, BACKUP_DIR)
                write_file(file_path, final_code)
    
    if all_new_strings:
        logging.info(f"Found {len(all_new_strings)} new unique strings to add to source file.")
        source_translations_flat.update(all_new_strings)
        updated_source_nested = unflatten_dict(source_translations_flat)
        if not args.dry_run:
            save_json(source_translation_file, updated_source_nested)
    else:
        logging.info("No new strings found in changed files.")

    target_languages = [lang for lang in config['languages'] if lang != source_lang]
    if args.lang:
        target_languages = [lang for lang in args.lang if lang in target_languages]

    if target_languages and all_new_strings:
        api_key = os.getenv("DEEPL_API_KEY")
        translator = initialize_translator(api_key)
        if not translator:
            logging.error("Translation step skipped due to translator initialization failure.")
            if not args.dry_run:
                save_state(STATE_FILE, current_state)
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


def handle_format(args):
    """Handler for the 'format' command."""
    logging.info("Formatting I18N files...")
    config = load_app_config()
    source_lang = config.get('source_language', DEFAULT_SOURCE_LANG)
    
    source_translation_file = get_translation_file_path(source_lang)
    source_translations_flat = flatten_dict(load_json(source_translation_file))

    if not source_translations_flat:
        logging.error(f"Source translation file '{source_translation_file}' is empty or missing. Cannot format.")
        return

    all_script_files = [p for p in SRC_DIR.rglob("script_lines.js")]

    # Iterate over all script files found in the project
    for file_path in all_script_files:
        if file_path.exists():
            logging.info(f"Formatting comments in: {file_path.relative_to(ACTUAL_PROJECT_ROOT)}")
            original_content = read_file(file_path)
            
            # Use the robust AST-based formatter from the previous step
            formatted_content = format_comments(original_content, source_translations_flat)
            
            if original_content != formatted_content:
                if args.dry_run:
                    print(f"--- Proposed changes for {file_path.name} ---\n{formatted_content}\n")
                else:
                    # No need to backup for format, as it's a non-destructive style change
                    write_file(file_path, formatted_content)
        else:
             logging.warning(f"Skipping format for non-existent file listed in state: {file_path}")


    logging.info("Sorting keys in all translation files for consistency...")
    for lang_code in config.get('languages', []):
        lang_file = get_translation_file_path(lang_code)
        if lang_file.exists():
            data = load_json(lang_file)
            if not args.dry_run:
                save_json(lang_file, data) # save_json sorts keys by default
    
    logging.info("Formatting complete.")


def handle_check(args):
    """Handler for the enhanced 'check' command (I18N Linter)."""
    logging.info("--- Running I18N Linter ---")
    config = load_app_config()
    if not config:
        logging.error("Configuration not found. Please run 'init' first.")
        return

    # --- 1. File Hash Check ---
    logging.info("\n[1/4] Checking file synchronization state...")
    previous_state = load_previous_state(STATE_FILE)
    current_state = get_current_state(SRC_DIR)
    changed_files = get_changed_files(current_state, previous_state, SRC_DIR)
    if changed_files:
        logging.warning(f"Found {len(changed_files)} file(s) out of sync (run `sync`):")
        for f in changed_files:
            print(f"  - {f.relative_to(SRC_DIR)}")
    else:
        logging.info("OK: All `script_lines.js` files are in sync.")

    # --- 2. Gather All Keys ---
    source_lang = config.get('source_language', DEFAULT_SOURCE_LANG)
    source_file = get_translation_file_path(source_lang)
    source_keys = set(flatten_dict(load_json(source_file)).keys())
    
    code_keys = set()
    script_files = [p for p in SRC_DIR.rglob("script_lines.js")]
    for file_path in script_files:
        content = read_file(file_path)
        code_keys.update(find_translation_keys(content))
    
    # --- 3. Orphaned and Missing Key Checks ---
    logging.info("\n[2/4] Checking for orphaned and missing keys...")
    orphaned_keys = source_keys - code_keys
    missing_keys = code_keys - source_keys

    if orphaned_keys:
        logging.warning(f"Found {len(orphaned_keys)} orphaned keys (exist in JSON but not used in code; run `clean`):")
        if args.details:
            for key in sorted(list(orphaned_keys)):
                print(f"  - {key}")
    else:
        logging.info("OK: No orphaned keys found.")

    if missing_keys:
        logging.error(f"CRITICAL: Found {len(missing_keys)} missing keys (used in code but not in `{source_file.name}`; run `sync`):")
        for key in sorted(list(missing_keys)):
            print(f"  - {key}")
    else:
        logging.info("OK: No missing keys found.")

    # --- 4. Missing Translation Check ---
    logging.info("\n[3/4] Checking for missing translations in target languages...")
    target_languages = [lang for lang in config['languages'] if lang != source_lang]
    all_targets_ok = True
    for lang_code in target_languages:
        target_file = get_translation_file_path(lang_code)
        target_keys = set(flatten_dict(load_json(target_file)).keys())
        missing_translations = source_keys - target_keys
        if missing_translations:
            all_targets_ok = False
            logging.warning(f"Language '{lang_code}' is missing {len(missing_translations)} translation(s) (run `sync`):")
            if args.details:
                for key in sorted(list(missing_translations)):
                    print(f"  - {key}")

    if all_targets_ok:
        logging.info("OK: All target languages are up to date.")
    
    logging.info("\n--- I18N Linter check complete. ---")


def handle_clean(args):
    """Handler for the 'clean' command to remove orphaned keys."""
    logging.info("--- Cleaning orphaned translation keys ---")
    config = load_app_config()
    source_lang = config.get('source_language', DEFAULT_SOURCE_LANG)
    
    # Step 1: Find all keys currently used in the codebase
    code_keys = set()
    script_files = [p for p in SRC_DIR.rglob("script_lines.js")]
    logging.info(f"Scanning {len(script_files)} script file(s) for active translation keys...")
    for file_path in script_files:
        content = read_file(file_path)
        code_keys.update(find_translation_keys(content))
    logging.info(f"Found {len(code_keys)} active keys in the codebase.")

    # Step 2: Find orphaned keys in the source language file
    source_file = get_translation_file_path(source_lang)
    source_translations_flat = flatten_dict(load_json(source_file))
    source_keys = set(source_translations_flat.keys())
    
    orphaned_keys = source_keys - code_keys

    if not orphaned_keys:
        logging.info("No orphaned keys found. All translation files are clean.")
        return

    logging.warning(f"Found {len(orphaned_keys)} orphaned keys to remove:")
    for key in sorted(list(orphaned_keys))[:10]: # Print a sample
        print(f"  - {key}")
    if len(orphaned_keys) > 10:
        print(f"  ... and {len(orphaned_keys) - 10} more.")

    # Step 3: Prompt for confirmation
    if not args.yes:
        if not _prompt_for_confirmation("This will permanently remove these keys from ALL language files. Are you sure you want to continue?"):
            logging.info("Clean operation cancelled by user.")
            return

    # Step 4: Remove orphaned keys from all language files
    for lang_code in config.get('languages', []):
        lang_file = get_translation_file_path(lang_code)
        if not lang_file.exists():
            continue
        
        logging.info(f"Cleaning file: {lang_file.relative_to(ACTUAL_PROJECT_ROOT)}")
        lang_translations_flat = flatten_dict(load_json(lang_file))
        
        # Create a new dict with only the keys that are NOT orphaned
        cleaned_translations = {
            key: value for key, value in lang_translations_flat.items() if key not in orphaned_keys
        }
        
        if len(cleaned_translations) < len(lang_translations_flat):
            if not args.dry_run:
                # Unflatten and save the cleaned dictionary
                save_json(lang_file, unflatten_dict(cleaned_translations))
            logging.info(f"Removed {len(lang_translations_flat) - len(cleaned_translations)} orphaned key(s) from {lang_file.name}.")
        else:
            logging.info(f"No orphaned keys found in {lang_file.name}.")
    
    if args.dry_run:
        logging.warning("DRY RUN finished. No files were modified.")
    else:
        logging.info("--- Clean operation complete. ---")

def main():
    parser = argparse.ArgumentParser(description="I18N Workflow Manager for React projects.")
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")

    parser_init = subparsers.add_parser("init", help="Initialize a new language.")
    parser_init.add_argument("lang_code", help="The language code to initialize (e.g., 'fr', 'de-DE').")
    parser_init.set_defaults(func=handle_init)

    parser_sync = subparsers.add_parser("sync", help="Synchronize strings from source code to translation files.")
    parser_sync.add_argument("--force", action="store_true", help="Force reprocessing of all source files.")
    parser_sync.add_argument("--lang", nargs='+', help="Specify target languages to translate (e.g., es fr).")
    parser_sync.add_argument("--dry-run", action="store_true", help="Simulate the process without writing any files.")
    parser_sync.set_defaults(func=handle_sync)

    parser_format = subparsers.add_parser("format", help="Adds/updates comments in script_lines.js and sorts JSON files.")
    parser_format.add_argument("--dry-run", action="store_true", help="Show proposed changes without writing to files.")
    parser_format.set_defaults(func=handle_format)

    parser_check = subparsers.add_parser("check", help="Lints I18N files for issues (orphaned/missing keys, etc.).")
    parser_check.add_argument("--details", action="store_true", help="Show detailed lists of missing/orphaned keys.")
    parser_check.set_defaults(func=handle_check)

    parser_clean = subparsers.add_parser("clean", help="Remove orphaned (unused) keys from translation files.")
    parser_clean.add_argument("--yes", action="store_true", help="Skip confirmation prompt.")
    parser_clean.add_argument("--dry-run", action="store_true", help="Simulate the process without writing any files.")
    parser_clean.set_defaults(func=handle_clean)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()