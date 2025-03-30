import pandas as pd
import json
import os
import sys

# Define relative paths based on the script's location
script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir) # Go up one level from 'tools' to the project root

EXCEL_PATH = os.path.join(base_dir, 'static/ASC/data/ProductTypes.xlsx')
JSON_PATH = os.path.join(base_dir, 'static/ASC/data/sps.json')

def parse_versions(version_string):
    """Parses the comma-separated version string into a list."""
    if pd.isna(version_string):
        return []
    # Split by comma, strip whitespace from each item, filter out empty strings
    return [v.strip() for v in str(version_string).split(',') if v.strip()]

def update_sps_from_excel():
    """
    Reads ProductTypes.xlsx and updates sps.json.

    - Updates existing entries based on 'Name'.
    - Adds new entries found in Excel but not in JSON.
    - Replaces 'description' and 'versions' for existing entries.
    - Warns about entries in JSON that are not present in Excel.
    """
    print(f"Reading Excel file: {EXCEL_PATH}")
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=0) # Read the first sheet
        # Ensure required columns exist
        required_cols = ['Name', 'Description', 'Versions']
        if not all(col in df.columns for col in required_cols):
            missing_cols = [col for col in required_cols if col not in df.columns]
            print(f"Error: Missing required columns in Excel file: {', '.join(missing_cols)}")
            sys.exit(1)
    except FileNotFoundError:
        print(f"Error: Excel file not found at {EXCEL_PATH}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        sys.exit(1)

    print(f"Reading JSON file: {JSON_PATH}")
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            sps_data = json.load(f)
            if not isinstance(sps_data, list):
                print(f"Error: Expected a JSON list in {JSON_PATH}, but got {type(sps_data)}")
                sys.exit(1)
    except FileNotFoundError:
        print(f"Warning: JSON file not found at {JSON_PATH}. Will create a new one.")
        sps_data = []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {JSON_PATH}. Check file format.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)

    # Create a dictionary for quick lookups and track original names
    sps_dict = {item['name']: item for item in sps_data if 'name' in item}
    original_sps_names = set(sps_dict.keys())
    excel_names = set()
    updated_entries = {}
    new_entries = []

    print("Processing Excel data...")
    for index, row in df.iterrows():
        name = row['Name']
        description = row['Description']
        versions_list = parse_versions(row['Versions'])

        if pd.isna(name) or not str(name).strip():
            print(f"Warning: Skipping row {index + 2} in Excel due to missing or empty 'Name'.")
            continue

        name = str(name).strip() # Ensure name is a string and stripped
        excel_names.add(name)

        if name in sps_dict:
            # Update existing entry
            entry = sps_dict[name]
            entry['description'] = str(description).strip() if pd.notna(description) else ""
            entry['versions'] = versions_list
            updated_entries[name] = entry # Keep track of updated ones
        else:
            # Add new entry (without ID for now)
            new_entry = {
                "name": name,
                "description": str(description).strip() if pd.notna(description) else "",
                "versions": versions_list
            }
            new_entries.append(new_entry)

    # --- Reconstruct the final list ---
    final_sps_list = []

    # 1. Process existing items: Keep all, update descriptions/versions if found in Excel
    #    Preserve original order.
    processed_names = set() # Keep track of names already added to avoid duplicates if JSON had them
    for item in sps_data:
        if 'name' in item:
            name = item['name']
            processed_names.add(name)
            if name in updated_entries:
                # Use the entry with the updated description/versions
                final_sps_list.append(updated_entries[name])
            else:
                # Keep the original item as is (it might be one not in Excel, or one in Excel but unchanged)
                final_sps_list.append(item)
        else:
             # Keep items without a 'name' field as well, if any
             final_sps_list.append(item)

    # 2. Add completely new entries from Excel (those not already in the original JSON)
    for new_entry in new_entries:
        if new_entry['name'] not in processed_names:
             final_sps_list.append(new_entry)

    # --- ID Generation (Placeholder) ---
    # Find the highest existing numeric ID to avoid collisions if we add new ones
    max_id = 0
    for item in final_sps_list:
        if 'id' in item and item['id'].startswith('SP-'):
            try:
                num = int(item['id'].split('-')[1])
                if num > max_id:
                    max_id = num
            except (IndexError, ValueError):
                continue # Ignore non-standard IDs

    # Assign IDs to new entries
    for item in final_sps_list:
        if 'id' not in item and 'name' in item: # Only assign to new entries that have names
             max_id += 1
             item['id'] = f"SP-{max_id:04d}"
             print(f"Assigned new ID {item['id']} to product '{item['name']}'")


    # Identify and warn about names in original JSON but not in Excel
    removed_names = original_sps_names - excel_names
    if removed_names:
        print("\n--- WARNING ---")
        print("The following product types were found in sps.json but ARE NOT present in ProductTypes.xlsx:")
        for name in sorted(list(removed_names)):
            print(f"- {name}")
        print("These entries have been KEPT in the sps.json file but were not updated.")
        print("---------------")


    print(f"\nWriting updated data to {JSON_PATH}...")
    try:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(final_sps_list, f, indent=2, ensure_ascii=False)
        print("Update complete.")
    except Exception as e:
        print(f"Error writing JSON file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    update_sps_from_excel()
