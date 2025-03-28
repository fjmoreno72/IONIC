"""
Utility functions for test case processing and version management.
"""
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime

def get_latest_version(test_cases: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Process a list of test cases and identify the latest version of each test case.
    
    Args:
        test_cases: List of test case dictionaries
        
    Returns:
        Dictionary mapping test case keys to their latest versions
    """
    latest_versions = {}
    test_cases_by_key = {}
    
    # Group test cases by key
    for test_case in test_cases:
        key = test_case.get('key')
        if not key:
            continue
            
        if key not in test_cases_by_key:
            test_cases_by_key[key] = []
            
        test_cases_by_key[key].append(test_case)
    
    # Determine latest version for each test case key
    for key, versions in test_cases_by_key.items():
        # Sort by version, defaulting to 1 if not present
        sorted_versions = sorted(
            versions, 
            key=lambda x: (
                int(x.get('version', 1)), 
                _parse_date(x.get('updated', ''))
            ), 
            reverse=True
        )
        
        if sorted_versions:
            latest_versions[key] = {
                'latest': sorted_versions[0],
                'all_versions': sorted_versions
            }
    
    return latest_versions

def _parse_date(date_str: str) -> datetime:
    """
    Parse a date string into a datetime object.
    
    Args:
        date_str: Date string in various formats
        
    Returns:
        Parsed datetime object or minimum datetime
    """
    if not date_str:
        return datetime.min
        
    # Try common date formats
    formats = [
        '%m/%d/%Y',      # MM/DD/YYYY
        '%Y-%m-%d',      # YYYY-MM-DD
        '%d/%m/%Y',      # DD/MM/YYYY
        '%m/%d/%Y %H:%M:%S',  # MM/DD/YYYY HH:MM:SS
        '%Y-%m-%d %H:%M:%S',  # YYYY-MM-DD HH:MM:SS
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
            
    # Default to minimum date if parsing fails
    return datetime.min
