import hashlib
import json
import logging
from pathlib import Path
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def _hash_file(file_path: Path) -> str:
    """
    Calculates the SHA256 hash of a file's content.

    Args:
        file_path: The path to the file to be hashed.

    Returns:
        The hex digest of the SHA256 hash, or an empty string if the file
        cannot be read.
    """
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            # Read and update hash in chunks to handle large files efficiently
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except IOError as e:
        logging.error(f"Could not read file for hashing: {file_path}. Error: {e}")
        return ""


def get_current_state(root_dir: Path) -> Dict[str, str]:
    """
    Traverses the root directory to find all 'script_lines.js' files and
    generates a state dictionary mapping their relative paths to their content hash.

    Args:
        root_dir: The root directory to search from (e.g., the 'src/' folder).

    Returns:
        A dictionary where keys are relative file paths (as strings) and
        values are their SHA256 content hashes.
    """
    logging.info(f"Scanning for 'script_lines.js' files in '{root_dir}'...")
    state: Dict[str, str] = {}
    
    # Using rglob to recursively find all matching files
    for file_path in root_dir.rglob("script_lines.js"):
        content_hash = _hash_file(file_path)
        if content_hash:
            # Store path as a string, relative to the root directory
            relative_path_str = str(file_path.relative_to(root_dir))
            state[relative_path_str] = content_hash
            
    logging.info(f"Found and hashed {len(state)} file(s).")
    return state


def load_previous_state(state_file: Path) -> Dict[str, str]:
    """
    Safely loads the state from the .i18n_state.json file.

    Args:
        state_file: The path to the state file.

    Returns:
        A dictionary containing the previously saved state, or an empty
        dictionary if the file doesn't exist or is invalid.
    """
    if not state_file.exists():
        logging.info("State file not found. Assuming this is the first run.")
        return {}
        
    try:
        with state_file.open('r', encoding='utf-8') as f:
            logging.info(f"Loading previous state from {state_file}.")
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logging.warning(f"Could not load or parse state file: {e}. Treating as first run.")
        return {}


def save_state(state_file: Path, current_state: Dict[str, str]):
    """
    Writes the current state to the .i18n_state.json file.

    Args:
        state_file: The path to the state file.
        current_state: The dictionary representing the current state of files.
    """
    try:
        # Ensure parent directory exists (though it should be the project root)
        state_file.parent.mkdir(parents=True, exist_ok=True)
        with state_file.open('w', encoding='utf-8') as f:
            # Sort keys for consistent file output
            json.dump(current_state, f, indent=2, sort_keys=True)
        logging.info(f"Successfully saved current state to {state_file}.")
    except IOError as e:
        logging.error(f"Failed to save state to {state_file}. Error: {e}")


def get_changed_files(
    current_state: Dict[str, str], 
    previous_state: Dict[str, str],
    project_root: Path
) -> List[Path]:
    """
    Compares the current and previous states to identify new or modified files.

    Args:
        current_state: The state dictionary from the current scan.
        previous_state: The state dictionary loaded from the state file.
        project_root: The project's root directory to resolve relative paths.

    Returns:
        A list of Path objects for files that are new or have a different hash.
    """
    changed_files: List[Path] = []
    
    for rel_path_str, current_hash in current_state.items():
        previous_hash = previous_state.get(rel_path_str)
        if previous_hash != current_hash:
            # This file is either new (previous_hash is None) or modified
            changed_files.append(project_root / rel_path_str)
            
    if changed_files:
        logging.info(f"Detected {len(changed_files)} new or modified file(s) to process.")
    else:
        logging.info("No file changes detected.")
        
    return changed_files