"""
Utility functions for file operations.
"""
import json
import logging
from pathlib import Path
from typing import Any, Dict, Union

def read_json_file(file_path: Union[str, Path]) -> Any:
    """
    Reads and parses a JSON file.

    Args:
        file_path: Path to the JSON file

    Returns:
        Parsed JSON content

    Raises:
        FileNotFoundError: If the file doesn't exist
        json.JSONDecodeError: If the JSON is invalid
    """
    if isinstance(file_path, str):
        file_path = Path(file_path)
        
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        logging.error(f"Error: File '{file_path}' not found.")
        raise
    except json.JSONDecodeError as e:
        logging.error(f"Error: Invalid JSON format in '{file_path}': {e}")
        raise

def write_json_file(data: Any, file_path: Union[str, Path]) -> bool:
    """
    Writes data to a JSON file.

    Args:
        data: Data to write
        file_path: Path to the output file

    Returns:
        True if successful, False otherwise
    """
    if isinstance(file_path, str):
        file_path = Path(file_path)
        
    try:
        # Ensure parent directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=4)
        logging.info(f"Successfully wrote data to {file_path}")
        return True
    except (IOError, OSError) as e:
        logging.error(f"Error writing to file {file_path}: {e}")
        return False

def write_markdown_file(content: str, file_path: Union[str, Path]) -> bool:
    """
    Writes markdown content to a file.

    Args:
        content: Markdown content to write
        file_path: Path to the output file

    Returns:
        True if successful, False otherwise
    """
    if isinstance(file_path, str):
        file_path = Path(file_path)
        
    try:
        # Ensure parent directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        logging.info(f"Successfully wrote markdown to {file_path}")
        return True
    except (IOError, OSError) as e:
        logging.error(f"Error writing to file {file_path}: {e}")
        return False
