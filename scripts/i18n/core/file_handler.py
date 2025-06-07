import json
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def find_script_files(root_dir: Path) -> List[Path]:
    """
    Recursively finds all files named 'script_lines.js' within a directory.

    Args:
        root_dir: The directory to start the search from.

    Returns:
        A list of Path objects for each found file.
    """
    logging.info(f"Searching for 'script_lines.js' files in '{root_dir}'...")
    files = list(root_dir.rglob("script_lines.js"))
    logging.info(f"Found {len(files)} matching file(s).")
    return files


def load_json(file_path: Path) -> Dict[str, Any]:
    """
    Safely loads data from a JSON file.

    Args:
        file_path: The path to the JSON file.

    Returns:
        A dictionary with the file's content, or an empty dictionary if the
        file does not exist or an error occurs.
    """
    if not file_path.exists():
        return {}
    
    try:
        with file_path.open('r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logging.warning(f"Could not load or parse JSON from '{file_path}': {e}")
        return {}


def save_json(file_path: Path, data: Dict[str, Any]):
    """
    Saves a dictionary to a JSON file with consistent formatting.
    Ensures parent directories exist and sorts keys for clean diffs.

    Args:
        file_path: The path where the JSON file will be saved.
        data: The dictionary data to save.
    """
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with file_path.open('w', encoding='utf-8') as f:
            # indent=2 and sort_keys=True ensure consistent, readable output
            json.dump(data, f, indent=2, sort_keys=True, ensure_ascii=False)
        logging.debug(f"Successfully saved JSON to '{file_path}'.")
    except IOError as e:
        logging.error(f"Failed to write JSON to '{file_path}': {e}")


def backup_file(file_path: Path, backup_dir: Path):
    """
    Creates a timestamped backup of a file.

    Args:
        file_path: The file to back up.
        backup_dir: The directory where the backup will be stored.
    """
    if not file_path.exists():
        logging.warning(f"Cannot back up '{file_path}' because it does not exist.")
        return

    try:
        backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create a more descriptive backup name
        backup_name = f"{file_path.name}.{timestamp}.bak"
        backup_path = backup_dir / backup_name
        
        shutil.copy2(file_path, backup_path)
        logging.info(f"Created backup of '{file_path.name}' at '{backup_path}'.")
    except (IOError, OSError) as e:
        logging.error(f"Could not create backup for '{file_path}': {e}")


def write_file(file_path: Path, content: str):
    """
    Writes string content to a file.

    Args:
        file_path: The path to the file to be written.
        content: The string content to write.
    """
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with file_path.open('w', encoding='utf-8') as f:
            f.write(content)
        logging.debug(f"Successfully wrote content to '{file_path}'.")
    except IOError as e:
        logging.error(f"Failed to write to file '{file_path}': {e}")

def read_file(file_path: Path) -> str:
    """
    Reads the content of a text file.

    Args:
        file_path: The path to the file.

    Returns:
        The content of the file as a string, or an empty string on error.
    """
    try:
        with file_path.open('r', encoding='utf-8') as f:
            return f.read()
    except IOError as e:
        logging.error(f"Failed to read file '{file_path}': {e}")
        return ""