#!/usr/bin/env python3
import json
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Set, Any




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


def tread_json_file(file_path: Path) -> Dict[str, Any]:
    """
    Reads and parses a JSON file.

    Args:
        file_path: Path to the JSON file

    Returns:
        Parsed JSON content as a dictionary

    Raises:
        FileNotFoundError: If the file doesn't exist
        json.JSONDecodeError: If the JSON is invalid
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in '{file_path}': {e}", file=sys.stderr)
        sys.exit(1)


def extract_null_testcase_entries(data: List[Dict[str, Any]], filter: str = None) -> List[Dict[str, Any]]:
    """
    Extracts entries with null testCaseId from the JSON data.

    Args:
        data: Parsed JSON data

    Returns:
        List of entries with null testCaseId
    """
    try:
        if filter != None:
            return [entry for entry in data if (entry.get('testCaseId') is None and entry.get('siNumber') == filter)]
        else:
            return [entry for entry in data if entry.get('testCaseId') is None]
    except AttributeError as e:
        print(f"Error: Unexpected JSON structure: {e}", file=sys.stderr)
        sys.exit(1)


def organize_hierarchical_data(entries: List[Dict[str, Any]]) -> Dict[str, SIEntry]:
    """
    Organizes the entries into a hierarchical structure.

    Args:
        entries: List of entries with null testCaseId

    Returns:
        Dictionary with hierarchical organization of data
    """
    # Create nested defaultdict structure
    hierarchy: Dict[str, SIEntry] = {}

    # First pass: Collect all unique EP names for each TIN
    tin_ep_names: Dict[str, Set[str]] = defaultdict(set)

    for entry in entries:
        tin_ep_names[entry['tinNumber']].add(entry.get('epName', ''))

    # Second pass: Build the hierarchy
    for entry in entries:
        si_number = entry['siNumber']
        tin_number = entry['tinNumber']
        tin_name = entry.get('tinName', '')
        ep_number = entry.get('epNumber', '')
        ep_name = entry.get('epName', '')
        sreq_number = entry.get('sreqNumber', '')
        sreq_name = entry.get('sreqName', '')

        if si_number not in hierarchy:
            hierarchy[si_number] = SIEntry(si_number=si_number, tins=[])

        # Find or create TIN entry
        tin_entry = next(
            (t for t in hierarchy[si_number].tins if t.tin_number == tin_number),
            None
        )

        if tin_entry is None:
            tin_entry = TINEntry(
                tin_number=tin_number,
                tin_name=tin_name,
                eps=[]
            )
            hierarchy[si_number].tins.append(tin_entry)

        # Find or create EP entry
        ep_entry = next(
            (ep for ep in tin_entry.eps if ep.ep_number == ep_number),
            None
        )

        if ep_entry is None and ep_number:
            ep_entry = EPEntry(
                ep_number=ep_number,
                ep_name=ep_name,
                sreqs=[]
            )
            tin_entry.eps.append(ep_entry)

        # Add SREQ to EP if it exists
        if ep_entry and sreq_number:
            sreq_entry = SREQEntry(
                sreq_number=sreq_number,
                sreq_name=sreq_name
            )
            ep_entry.sreqs.append(sreq_entry)

    return hierarchy


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
                    markdown_lines.append(f"- **{sreq.sreq_number}**: {sreq.sreq_name[:78]}")

                markdown_lines.append("")  # Add blank line between EPs

            markdown_lines.append("")  # Add blank line between TINs

        markdown_lines.append("")  # Add blank line between SIs

    return "\n".join(markdown_lines)


def twrite_markdown_file(content: str, output_path: Path) -> None:
    """
    Writes the markdown content to a file.

    Args:
        content: Markdown content to write
        output_path: Path to the output file
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Analysis report has been written to {output_path}", file=sys.stderr)


    except IOError as e:
        print(f"Error writing to output file: {e}", file=sys.stderr)
        sys.exit(1)


def tsreq_analysis():
    """Main function to orchestrate the analysis process"""
    print("hi")
    try:
        # Read and parse the JSON file
        #output_path = os.path.join(app.static_folder, 'SREQ.md')
        #input_path = os.path.join(app.static_folder, 'SREQ.md')

        input_path = Path("SREQ.json")
        output_path = Path("SREQ.md")
        data = read_json_file(input_path)

        # Extract entries with null testCaseId
        null_entries = extract_null_testcase_entries(data)

        if not null_entries:
            print("No entries found with null testCaseId.", file=sys.stderr)
            sys.exit(0)

        # Organize the data hierarchically
        hierarchy = organize_hierarchical_data(null_entries)

        # Generate markdown output
        markdown_output = generate_markdown(hierarchy)

        # Write to output file
        write_markdown_file(markdown_output, output_path)

    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    tsreq_analysis()
