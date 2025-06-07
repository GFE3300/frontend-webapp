#!/usr/bin/env python3
import os
import json
import argparse
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple

# Third-party imports
try:
    import deepl
    from dotenv import load_dotenv
except ImportError:
    print("\n" + "="*80)
    print("Error: Required libraries 'deepl' or 'python-dotenv' are not installed.")
    print("Please install them by running: pip install deepl python-dotenv")
    print("="*80 + "\n")
    exit(1)

# --- Configuration ---
LOG_LEVEL = logging.INFO
logging.basicConfig(level=LOG_LEVEL, format='%(levelname)s: %(message)s')

# --- Helper Functions ---

def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Safely loads a JSON file, returning an empty dict if it doesn't exist."""
    if not file_path.exists():
        return {}
    try:
        with file_path.open('r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logging.error(f"Failed to load or parse {file_path}: {e}")
        return {}

def save_json_file(file_path: Path, data: Dict[str, Any]):
    """Saves data to a JSON file, creating directories if needed."""
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with file_path.open('w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, sort_keys=True)
        logging.info(f"Successfully saved updated translations to {file_path}")
    except IOError as e:
        logging.error(f"Failed to write to {file_path}: {e}")

def find_missing_keys(source: Dict, target: Dict, path_prefix: str = "") -> Dict[str, str]:
    """
    Recursively finds keys present in the source dict but missing in the target dict.
    Returns a flattened dictionary of {'key.path': 'value_to_translate'}.
    """
    missing = {}
    for key, source_value in source.items():
        current_path = f"{path_prefix}.{key}" if path_prefix else key

        if key not in target:
            # If the entire key is missing, add all its string children
            if isinstance(source_value, dict):
                missing.update(find_missing_keys(source_value, {}, current_path))
            elif isinstance(source_value, str) and source_value.strip():
                missing[current_path] = source_value
        else:
            target_value = target[key]
            # If key exists but is a dict, we need to check its children
            if isinstance(source_value, dict) and isinstance(target_value, dict):
                missing.update(find_missing_keys(source_value, target_value, current_path))
    return missing

def set_nested_key(d: Dict, key_string: str, value: Any):
    """Sets a value in a nested dictionary using a dot-separated key string."""
    keys = key_string.split('.')
    current_level = d
    for key in keys[:-1]:
        current_level = current_level.setdefault(key, {})
    current_level[keys[-1]] = value

def sort_dict_recursively(d: Dict) -> Dict:
    """Recursively sorts a dictionary by its keys."""
    return {k: sort_dict_recursively(v) if isinstance(v, dict) else v for k, v in sorted(d.items())}

# --- Main Logic ---

def translate_language(
    source_data: Dict,
    source_file_path: Path,
    target_lang_code: str,
    translator: deepl.Translator
):
    """
    Orchestrates the translation process for a single target language.
    """
    logging.info(f"\n{'='*20} Processing language: {target_lang_code.upper()} {'='*20}")

    # Determine target file path (e.g., src/locales/en/f.json -> src/locales/es/f.json)
    target_lang_dir = source_file_path.parent.parent / target_lang_code
    target_file_path = target_lang_dir / source_file_path.name

    logging.info(f"Source file: {source_file_path}")
    logging.info(f"Target file: {target_file_path}")

    target_data = load_json_file(target_file_path)

    # Find what needs to be translated
    missing_items = find_missing_keys(source_data, target_data)

    if not missing_items:
        logging.info(f"Target file for '{target_lang_code.upper()}' is already up to date. No new strings found.")
        return

    logging.info(f"Found {len(missing_items)} new string(s) to translate.")

    # Prepare for batch translation
    keys_to_translate = list(missing_items.keys())
    texts_to_translate = list(missing_items.values())

    logging.info("Sending to DeepL for translation:")
    for text in texts_to_translate:
        logging.info(f"  - \"{text[:70]}{'...' if len(text) > 70 else ''}\"")

    try:
        # Perform the batch translation
        # DeepL handles placeholder syntax like {var} automatically.
        results = translator.translate_text(
            texts_to_translate,
            target_lang=target_lang_code.upper(),
            # For formal/informal language control if needed:
            # formality="less" if target_lang_code.lower() in ['es', 'fr', 'de'] else "default"
        )

        # Create a dictionary of newly translated items
        new_translations: Dict[str, str] = {
            key: result.text
            for key, result in zip(keys_to_translate, results)
        }

        # Merge new translations into the existing target data
        updated_target_data = target_data.copy()
        for key_path, translated_text in new_translations.items():
            set_nested_key(updated_target_data, key_path, translated_text)

        # Sort the final dictionary for consistency
        sorted_data = sort_dict_recursively(updated_target_data)

        # Save the updated file
        save_json_file(target_file_path, sorted_data)

    except deepl.DeepLException as e:
        logging.error(f"An error occurred with the DeepL API: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred during translation: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Translates new strings in a JSON file using the DeepL API.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "--source-file",
        default="src/locales/en/translation.json",
        help="Path to the source language JSON file."
    )
    parser.add_argument(
        "target_languages",
        nargs='+',
        help="One or more target language codes (e.g., es fr de-DE ja)."
    )
    args = parser.parse_args()

    # Load environment variables (for DEEPL_API_KEY)
    load_dotenv()
    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        logging.error("DEEPL_API_KEY environment variable not found.")
        logging.error("Please create a .env file or set the environment variable.")
        exit(1)

    # Initialize DeepL translator
    try:
        translator = deepl.Translator(api_key)
        logging.info("DeepL translator initialized successfully.")
    except Exception as e:
        logging.error(f"Failed to initialize DeepL translator: {e}")
        exit(1)


    source_file = Path(args.source_file)
    if not source_file.exists():
        logging.error(f"Source file not found: {source_file}")
        exit(1)

    source_data = load_json_file(source_file)
    if not source_data:
        logging.warning("Source file is empty or could not be read. Nothing to do.")
        return

    for lang_code in args.target_languages:
        translate_language(source_data, source_file, lang_code.lower(), translator)

if __name__ == "__main__":
    main()