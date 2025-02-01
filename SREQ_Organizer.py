import json
from collections import defaultdict
import os
from pathlib import Path


def read_and_organize_requirements():
    # Get the script's directory
    script_dir = Path(__file__).parent.absolute()

    # Define input and output paths
    input_path = script_dir / 'static' / 'SREQ.json'
    output_path = script_dir / 'static' / 'SREQ_GROUP.md'

    # Create static directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    try:
        # Read the JSON file
        with open(input_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # First level organization by SI
        si_groups = {}

        # Group requirements hierarchically
        for item in data:
            si_key = (item['siNumber'], item['siName'])
            tin_key = (item['tinNumber'], item['epName'])
            sreq_info = (item['sreqNumber'], item['sreqName'])
            test_case = (item['testCaseKey'], item['testCaseName'])

            # Initialize SI level if not exists
            if si_key not in si_groups:
                si_groups[si_key] = {}

            # Initialize TIN level if not exists
            if tin_key not in si_groups[si_key]:
                si_groups[si_key][tin_key] = {}

            # Initialize SREQ level if not exists
            if sreq_info[0] not in si_groups[si_key][tin_key]:
                si_groups[si_key][tin_key][sreq_info[0]] = {
                    'sreq_name': sreq_info[1],
                    'test_cases': set()  # Using set to avoid duplicates
                }

            # Add test case only if both key and name are not None
            if test_case[0] is not None and test_case[1] is not None:
                si_groups[si_key][tin_key][sreq_info[0]]['test_cases'].add(test_case)

            # Create and write to markdown file
            with open(output_path, 'w', encoding='utf-8') as md_file:
                md_file.write("# Requirements Organization\n\n")

                # Iterate through SI level
                for (si_number, si_name), tin_groups in si_groups.items():
                    # Level 1: SI Information
                    md_file.write(f"## {si_number} -> {si_name}\n\n")

                    # Iterate through TIN level
                    for (tin_number, ep_name), sreqs in tin_groups.items():
                        # Level 2: TIN Information
                        md_file.write(f"### {tin_number} -> {ep_name}\n\n")

                        # Level 3: SREQ Information with Level 4: Test Cases
                        for sreq_number, sreq_data in sreqs.items():
                            md_file.write(f"#### {sreq_number} -> {sreq_data['sreq_name']}\n\n")

                            # Level 4: Test Cases (only if there are any)
                            if sreq_data['test_cases']:
                                for test_key, test_name in sorted(sreq_data['test_cases']):
                                    md_file.write(f"- {test_key} -> {test_name}\n\n")

                        md_file.write("\n\n")  # Separator between different SI groups

        print(f"Markdown file has been created successfully at: {output_path}")

    except FileNotFoundError:
        print(f"Error: Could not find input file at {input_path}")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in input file")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")


if __name__ == "__main__":
    read_and_organize_requirements()