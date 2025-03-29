#!/usr/bin/env python3
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set, Any


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


def analyze_ier_data(json_data: List[dict]) -> Dict[str, Dict[str, Set[str]]]:
    """
    Analyze IER data and organize null testCaseId entries hierarchically.

    Args:
        json_data: List of dictionaries containing IER data

    Returns:
        Dictionary organized by piNumber -> ierNumber -> tinNames
    """
    # Create nested defaultdict for hierarchical storage
    hierarchy = defaultdict(lambda: defaultdict(set))

    # Filter and organize data
    for entry in json_data:
        if entry.get('testCaseId') is None:  # Only process entries with null testCaseId
            pi_number = entry['piNumber']
            ier_number = entry['ierNumber']
            ier_name = entry['ierName']
            tin_name = entry['tinName']

            # Store as "ierNumber: ierName" -> set of tinNames
            hierarchy[pi_number][f"{ier_number}: {ier_name}"].add(tin_name)

    return hierarchy


def generate_ier_markdown_output(hierarchy: Dict[str, Dict[str, Set[str]]]) -> str:
    """
    Generate formatted markdown output from the hierarchical data.

    Args:
        hierarchy: Dictionary organized by piNumber -> ierNumber -> tinNames

    Returns:
        Formatted markdown string
    """
    output = ["# Elements with Null TestCaseId\n"]

    # Sort piNumbers for consistent output
    for pi_number in sorted(hierarchy.keys()):
        output.append(f"\n## {pi_number}")

        # Sort ierNumbers within each piNumber
        for ier_full in sorted(hierarchy[pi_number].keys()):
            output.append(f"\n### {ier_full}")

            # Sort tinNames for consistent output
            for tin_name in sorted(hierarchy[pi_number][ier_full]):
                output.append(f"- TIN: {tin_name}")

    return "\n".join(output)


def tier_analysis():
    """Main function to orchestrate the analysis process"""
    print("IER")

    input_path = Path("IER.json")

    output_path = Path("IER.md")

    data = read_json_file(input_path)

    hierarchy = analyze_ier_data(data)

    markdown_output = generate_ier_markdown_output(hierarchy)

    write_markdown_file(markdown_output, output_path)

if __name__ == "__main__":
    tier_analysis()
