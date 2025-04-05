"""
Utility functions for file operations.
"""
import json
import logging
from pathlib import Path
from typing import Any, Dict, Union, Optional # Added Optional
from flask import session # Added for session access

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

def get_dynamic_data_path(filename: str, environment: Optional[str] = None) -> Path:
    """
    Constructs the path to a data file within the 'data/ciav' or 'data/cwix'
    directory. Uses the provided environment if given, otherwise falls back
    to the current session environment, defaulting to 'ciav'.

    Args:
        filename: The name of the data file (e.g., "IER.json").

    Args:
        filename: The name of the data file (e.g., "IER.json").
        environment: Optional environment string ('ciav' or 'cwix').

    Returns:
        A Path object representing the full path to the file.
    """
    # Determine the environment subfolder
    if environment is None:
        # Try to get from session if not explicitly provided
        environment = session.get('environment', 'ciav') # Default to 'ciav' if not set
        if environment not in ['ciav', 'cwix']:
            logging.warning(f"Invalid environment '{environment}' found in session, defaulting to 'ciav'.")
            environment = 'ciav'
    elif environment not in ['ciav', 'cwix']:
        logging.warning(f"Invalid environment '{environment}' provided, defaulting to 'ciav'.")
        environment = 'ciav'

    # Construct the path relative to the project root
    # Assumes the application runs from the IONIC2 directory where 'data' resides
    base_data_path = Path('data')
    dynamic_path = base_data_path / environment / filename
    logging.debug(f"Constructed dynamic data path: {dynamic_path}") # Optional: for debugging
    return dynamic_path

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
