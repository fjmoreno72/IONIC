"""
Analysis functionality for SREQ (System Requirements) data.
"""
import logging
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Set, Any, Optional, Tuple

from app.utils.file_operations import read_json_file, write_markdown_file, get_dynamic_data_path

@dataclass
class SREQEntry:
    """Data class to store SREQ-related information"""
    sreq_number: str
    sreq_name: str

@dataclass
class EPEntry:
    """Data class to store EP-related information"""
    ep_number: str
    ep_name: str
    sreqs: List[SREQEntry]

@dataclass
class TINEntry:
    """Data class to store TIN-related information"""
    tin_number: str
    tin_name: str
    eps: List[EPEntry]

@dataclass
class SIEntry:
    """Data class to store SI-related information"""
    si_number: str
    tins: List[TINEntry]

@dataclass
class FunctionEntry:
    """Data class to store Function-related information"""
    function_name: str
    sreqs: List[SREQEntry]

def extract_null_testcase_entries(data: List[Dict[str, Any]], filter_si: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Extracts entries with null testCaseId from the JSON data.

    Args:
        data: Parsed JSON data
        filter_si: Optional SI number to filter by

    Returns:
        List of entries with null testCaseId
    """
    try:
        if filter_si:
            return [entry for entry in data if (entry.get('testCaseId') is None and entry.get('siNumber') == filter_si)]
        else:
            return [entry for entry in data if entry.get('testCaseId') is None]
    except AttributeError as e:
        logging.error(f"Unexpected JSON structure: {e}")
        raise
    except Exception as e:
        logging.exception(f"Error extracting null testcase entries: {e}")
        raise

def organize_hierarchical_data(entries: List[Dict[str, Any]]) -> Dict[str, SIEntry]:
    """
    Organizes the entries into a hierarchical structure.

    Args:
        entries: List of entries with null testCaseId

    Returns:
        Dictionary with hierarchical organization of data
    """
    # Create dictionary for hierarchical storage
    hierarchy: Dict[str, SIEntry] = {}

    # First pass: Collect all unique EP names for each TIN
    tin_ep_names: Dict[str, Set[str]] = defaultdict(set)
    for entry in entries:
        tin_ep_names[entry.get('tinNumber', '')].add(entry.get('epName', ''))

    # Second pass: Build the hierarchy
    for entry in entries:
        si_number = entry.get('siNumber', '')
        tin_number = entry.get('tinNumber', '')
        tin_name = entry.get('tinName', '')
        ep_number = entry.get('epNumber', '')
        ep_name = entry.get('epName', '')
        sreq_number = entry.get('sreqNumber', '')
        sreq_name = entry.get('sreqName', '')

        # Skip entries with missing key fields
        if not si_number or not tin_number:
            continue

        # Initialize SI entry if not exists
        if si_number not in hierarchy:
            hierarchy[si_number] = SIEntry(si_number=si_number, tins=[])

        # Find or create TIN entry
        tin_entry = next((t for t in hierarchy[si_number].tins if t.tin_number == tin_number), None)
        if tin_entry is None:
            tin_entry = TINEntry(tin_number=tin_number, tin_name=tin_name, eps=[])
            hierarchy[si_number].tins.append(tin_entry)

        # Find or create EP entry
        ep_entry = next((ep for ep in tin_entry.eps if ep.ep_number == ep_number), None)
        if ep_entry is None and ep_number:
            ep_entry = EPEntry(ep_number=ep_number, ep_name=ep_name, sreqs=[])
            tin_entry.eps.append(ep_entry)

        # Add SREQ to EP if it exists
        if ep_entry and sreq_number:
            sreq_entry = SREQEntry(sreq_number=sreq_number, sreq_name=sreq_name)
            ep_entry.sreqs.append(sreq_entry)

    return hierarchy


def create_service_actor_map(si_groups: Dict):
           """
           Creates a service to actor mapping from si_groups data.
           Updates or creates service_actors.json with the mapping.
           
           Args:
               si_groups: Dictionary output from organize_functional_data containing 
                         SI, SREQ, and actor information.
           
           Returns:
               Dictionary with SI keys as keys and lists of unique actors as values
           """
           import json
           
           # Initialize the mapping dictionary
           service_actor_map = {}
           
           # Output file path
           service_actors_path = get_dynamic_data_path("service_actors.json")
           
           # Process si_groups to extract service-actor mappings
           for si_key, functions_data in si_groups.items():
               si_name = si_key[1]  # Extract SI name
               si_number = si_key[0]  # Extract SI number
               
               # Create a key for this SI in the mapping
               if si_key not in service_actor_map:
                   service_actor_map[si_key] = []
               
               # Track all unique actors for this SI
               actors_for_si = set()
               
               # Iterate through functions in this SI
               for function_name, sreqs_data in functions_data.items():
                   # Iterate through SREQs in this function
                   for sreq_number, sreq_info in sreqs_data.items():
                       # Get test cases from SREQ info
                       test_cases = sreq_info.get('test_cases', {})
                       
                       # Iterate through test cases to extract actors
                       for test_case_key, test_case_data in test_cases.items():
                           # test_case_data format is (key, name, [actors], version)
                           if len(test_case_data) >= 3:
                               actors_list = test_case_data[2]
                               # Add each actor to the set of unique actors for this SI
                               for actor in actors_list:
                                   if actor != 'N/A':
                                       actors_for_si.add(actor)
               
               # Convert set to list for JSON serialization
               service_actor_map[si_key] = list(actors_for_si)
           
           # Prepare a simplified version for JSON serialization
           # JSON cannot have tuples as keys, so convert to string format
           json_compatible_map = {
               f"{si_key[0]}_{si_key[1]}": actors
               for si_key, actors in service_actor_map.items()
           }
           
           # Write the updated mapping to the file
           try:
               with open(service_actors_path, 'w') as f:
                   json.dump(json_compatible_map, f, indent=2)
               logging.info(f"Service-actor mapping saved to {service_actors_path}")
           except Exception as e:
               logging.error(f"Error writing service_actors.json: {e}")
           
           return service_actor_map

def organize_functional_data(sreq_data: List[Dict[str, Any]], func_data: List[Dict[str, Any]]) -> Dict[Tuple[str, str], Dict[str, Dict[str, Dict[str, Any]]]]:
    """
    Organize SREQ data by functional area.

    Args:
        sreq_data: List of SREQ data entries
        func_data: List of functional area mapping entries

    Returns:
        Data organized by SI -> Function -> SREQ -> test cases
    """
    # Create mapping of SREQ numbers to their function and SI name
    sreq_mapping = {}
    for item in func_data:
        sreq_number = item.get('sreqNumber')
        if sreq_number:
            sreq_mapping[sreq_number] = {
                'function': item.get('funName', ''),
                'siName': item.get('siName', '')
            }

    # Track unmapped SREQs
    unmapped_sreqs = []

    # Create nested structure
    si_groups = {}
    for item in sreq_data:
        # Use get() with default values for fields that might not exist
        si_key = (item.get('siNumber', ''), item.get('siName', ''))
        sreq_info = (item.get('sreqNumber', ''), item.get('sreqName', ''))
        actor = item.get('actor', 'N/A')
        test_case_key = item.get('testCaseKey')
        test_case_name = item.get('testCaseName')
        test_case_version = item.get('testCaseVersion') # Extract the version
        test_case_coverage_type = item.get('coverageType')
        status = item.get('status')

        if status == 'Deprecated' or status == 'Draft':
            continue

        # If the requirement is covered in a dependency
        if test_case_coverage_type == 'tdp' or test_case_coverage_type == 'idp':
            continue

        # Check if SREQ has a function mapping
        mapping = sreq_mapping.get(sreq_info[0])
        if not mapping:
            unmapped_sreqs.append({
                'sreqNumber': sreq_info[0],
                'sreqName': sreq_info[1],
                'siNumber': si_key[0],
                'siName': si_key[1]
            })
            continue

        function_name = mapping['function']

        # Initialize nested structure
        if si_key not in si_groups:
            si_groups[si_key] = {}

        if function_name not in si_groups[si_key]:
            si_groups[si_key][function_name] = {}

        if sreq_info[0] not in si_groups[si_key][function_name]:
            si_groups[si_key][function_name][sreq_info[0]] = {
                'sreq_name': sreq_info[1],
                'test_cases': {}
            }

        # Add test case if available
        if test_case_key is not None and test_case_name is not None:
            # If test case already exists, append actor to its list
            test_cases = si_groups[si_key][function_name][sreq_info[0]]['test_cases']
            
            # If test case already exists, append actor to its list
            if test_case_key in test_cases:
                existing_test = test_cases[test_case_key]
                if actor not in existing_test[2]:
                    existing_test[2].append(actor)
            else:
                # Add new test case with actor and version
                test_cases[test_case_key] = (test_case_key, test_case_name, [actor], test_case_version)

    # Log unmapped SREQs if any
    if unmapped_sreqs:
        logging.warning(f"Found {len(unmapped_sreqs)} SREQs without function mappings.")
        for sreq in unmapped_sreqs:
            logging.info(f"Unmapped SREQ: {sreq.get('sreqNumber', '')} - {sreq.get('sreqName', '')}")

    create_service_actor_map(si_groups)


    return si_groups

def organize_tin_data(sreq_data: List[Dict[str, Any]]) -> Dict[Tuple[str, str], Dict[Tuple[str, str], Dict[str, Dict[str, Dict[str, Any]]]]]:
    """
    Organize SREQ data by TIN.

    Args:
        sreq_data: List of SREQ data entries

    Returns:
        Data organized by SI -> TIN -> SREQ -> test cases
    """
    si_groups = {}
    for item in sreq_data:
        # Use get() with default values for fields that might not exist
        si_key = (item.get('siNumber', ''), item.get('siName', ''))
        sreq_info = (item.get('sreqNumber', ''), item.get('sreqName', ''))
        actor = item.get('actor', 'N/A')
        test_case_key = item.get('testCaseKey')
        test_case_name = item.get('testCaseName')
        test_case_coverage_type = item.get('coverageType')
        status = item.get('status') 

        tin_key = (item.get('tinNumber', ''), item.get('epName', '')) 

        if status == 'Deprecated' or status == 'Draft':
            continue 

        # If the requirement is covered in a dependency
        if test_case_coverage_type == 'tdp' or test_case_coverage_type == 'idp':
            continue

        # Initialize nested structure
        if si_key not in si_groups:
                si_groups[si_key] = {}

        if tin_key not in si_groups[si_key]:
                si_groups[si_key][tin_key] = {}

        if sreq_info[0] not in si_groups[si_key][tin_key]:
                si_groups[si_key][tin_key][sreq_info[0]] = {
                    'sreq_name': sreq_info[1],
                    'test_cases': {}
                }

        # Add test case if available
        if test_case_key is not None and test_case_name is not None:
            # If test case already exists, append actor to its list
            test_cases = si_groups[si_key][tin_key][sreq_info[0]]['test_cases']
            
            if test_case_key in test_cases:
                existing_test = test_cases[test_case_key]
                if actor not in existing_test[2]:
                    existing_test[2].append(actor)
            else:
                # Add new test case with actor
                test_cases[test_case_key] = (test_case_key, test_case_name, [actor])
    
    return si_groups

def generate_markdown(hierarchy: Dict[str, SIEntry]) -> str:
    """
    Generates formatted markdown output from the hierarchical data.

    Args:
        hierarchy: Organized hierarchical data

    Returns:
        Formatted markdown string
    """
    markdown_lines = ["# SREQ Analysis Report - Null TestCase Entries\n"]

    # Sort SI numbers
    for si_number in sorted(hierarchy.keys()):
        si_entry = hierarchy[si_number]
        markdown_lines.append(f"## SI Number: {si_number}\n")

        # Sort TINs
        for tin in sorted(si_entry.tins, key=lambda x: x.tin_number):
            markdown_lines.append(f"### TIN: {tin.tin_number} ({tin.tin_name})\n")

            # Sort EPs
            for ep in sorted(tin.eps, key=lambda x: x.ep_number):
                markdown_lines.append(f"#### EP {ep.ep_number}: {ep.ep_name}\n")

                # Sort SREQs
                for sreq in sorted(ep.sreqs, key=lambda x: x.sreq_number):
                    # Truncate long SREQ names to avoid excessive line length
                    sreq_name_display = sreq.sreq_name[:78] + "..." if len(sreq.sreq_name) > 78 else sreq.sreq_name
                    markdown_lines.append(f"- **{sreq.sreq_number}**: {sreq_name_display}")

                markdown_lines.append("")  # Add blank line between EPs

            markdown_lines.append("")  # Add blank line between TINs

        markdown_lines.append("")  # Add blank line between SIs

    return "\n".join(markdown_lines)

def analyze_sreq_file(
    input_file: Path, 
    output_file: Optional[Path] = None,
    func_file: Optional[Path] = None
) -> str:
    """
    Analyze a SREQ data file and generate a markdown report.
    
    Args:
        input_file: Path to the input JSON file
        output_file: Optional path to write markdown output
        func_file: Optional path to functional mapping file
        
    Returns:
        Generated markdown content
    """
    logging.info(f"Analyzing SREQ data from {input_file}")
    
    try:
        # Read and parse data
        data = read_json_file(input_file)
        
        # Extract entries with null testCaseId
        null_entries = extract_null_testcase_entries(data)
        
        if not null_entries:
            message = "No entries found with null testCaseId."
            logging.info(message)
            return message
        
        # Organize the data hierarchically
        hierarchy = organize_hierarchical_data(null_entries)
        
        # Generate markdown output
        markdown_output = generate_markdown(hierarchy)
        
        # Save to file if output_file specified
        if output_file:
            write_markdown_file(markdown_output, output_file)
            logging.info(f"SREQ analysis written to {output_file}")
        
        return markdown_output
        
    except Exception as e:
        logging.exception(f"Error analyzing SREQ data: {e}")
        raise
