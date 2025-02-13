import json
from collections import defaultdict


def process_json_to_markdown():
    # Read JSON file
    with open('./static/SREQ.json', 'r') as file:
        data = json.load(file)

    # Create a defaultdict to store actors by siName
    actors_by_si = defaultdict(set)

    # Handle both single object and list of objects
    if isinstance(data, dict):
        data = [data]

    # Process each entry
    for entry in data:
        if (entry.get('testCaseId') is not None and
                entry.get('status') is not None and
                entry.get('actor') and
                entry.get('siName')):
            actors_by_si[entry['siName']].add(entry['actor'])

    # Generate markdown content in mind map format
    markdown_content = "# System Actors Map\n\n"

    for si_name in sorted(actors_by_si.keys()):
        markdown_content += f"- {si_name}\n"
        for actor in sorted(actors_by_si[si_name]):
            markdown_content += f"  - {actor}\n"

    # Write to markdown file
    with open('./static/Actors.md', 'w') as file:
        file.write(markdown_content)


if __name__ == "__main__":
    process_json_to_markdown()