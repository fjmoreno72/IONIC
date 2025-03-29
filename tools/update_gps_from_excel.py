import pandas as pd
import json
import os
import sys

# Define relative paths based on the script's location
script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir) # Go up one level from 'tools' to the project root

EXCEL_PATH = os.path.join(base_dir, 'static/ASC/data/AssetTypes.xlsx')
JSON_PATH = os.path.join(base_dir, 'static/ASC/data/gps.json')

def update_gps_from_excel():
    """
    Reads AssetTypes.xlsx and updates gps.json.

    - Updates existing entries based on 'Name', only changing 'description'.
    - Adds new entries found in Excel but not in JSON.
    - Assigns new sequential IDs to new entries.
    - Removes entries from JSON that are not present in Excel and warns about them.
    """
    print(f"Reading Excel file: {EXCEL_PATH}")
    try:
        # Assuming data is in the first sheet and columns are named 'Name' and 'Description'
        df = pd.read_excel(EXCEL_PATH, sheet_name=0)
        required_cols = ['Name', 'Description']
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
            gps_data = json.load(f)
            if not isinstance(gps_data, list):
                print(f"Error: Expected a JSON list in {JSON_PATH}, but got {type(gps_data)}")
                sys.exit(1)
    except FileNotFoundError:
        print(f"Warning: JSON file not found at {JSON_PATH}. Will create a new one.")
        gps_data = []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {JSON_PATH}. Check file format.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)

    # Create a dictionary for quick lookups and track original names
    gps_dict = {item['name']: item for item in gps_data if 'name' in item}
    original_gps_names = set(gps_dict.keys())
    excel_names = set()
    updated_entries = {} # Store references to entries that were updated
    new_entries = []     # Store completely new entries to be added

    print("Processing Excel data...")
    for index, row in df.iterrows():
        name = row['Name']
        description = row['Description']

        if pd.isna(name) or not str(name).strip():
            print(f"Warning: Skipping row {index + 2} in Excel due to missing or empty 'Name'.")
            continue

        name = str(name).strip() # Ensure name is a string and stripped
        excel_names.add(name)

        if name in gps_dict:
            # Update existing entry's description ONLY
            entry = gps_dict[name]
            entry['description'] = str(description).strip() if pd.notna(description) else ""
            updated_entries[name] = entry # Mark as processed/updated
        else:
            # Prepare new entry
            new_entry = {
                "name": name,
                "description": str(description).strip() if pd.notna(description) else "",
                # iconPath and id will be added later
            }
            new_entries.append(new_entry)

    # --- Reconstruct the final list ---
    final_gps_list = []

    # 1. Keep existing items that were found in Excel (either updated or untouched description-wise)
    #    Preserve original order as much as possible.
    for item in gps_data:
        if 'name' in item and item['name'] in excel_names:
             # If it was updated, use the updated reference, otherwise use the original item
            final_gps_list.append(updated_entries.get(item['name'], item))

    # 2. Add completely new entries from Excel
    final_gps_list.extend(new_entries)

    # --- ID Generation ---
    # Find the highest existing numeric ID to avoid collisions
    max_id_num = 0
    for item in final_gps_list:
        if 'id' in item and item['id'].startswith('GP-'):
            try:
                num = int(item['id'].split('-')[1])
                if num > max_id_num:
                    max_id_num = num
            except (IndexError, ValueError, TypeError):
                continue # Ignore non-standard IDs

    # Assign IDs to new entries that don't have one yet
    for item in final_gps_list:
        if 'id' not in item and 'name' in item: # Check if it's a new entry needing an ID
             max_id_num += 1
             item['id'] = f"GP-{max_id_num:04d}"
             print(f"Assigned new ID {item['id']} to product '{item['name']}'")
             # New entries from Excel don't have iconPath initially
             item['iconPath'] = "" # Or null, depending on preference

    # --- Warning for removed items ---
    removed_names = original_gps_names - excel_names
    if removed_names:
        print("\n--- WARNING ---")
        print("The following GPs were found in gps.json but not in AssetTypes.xlsx:")
        for name in sorted(list(removed_names)):
            print(f"- {name}")
        print("These entries have been REMOVED from the updated gps.json file.")
        print("---------------")

    print(f"\nWriting updated data to {JSON_PATH}...")
    try:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(final_gps_list, f, indent=2, ensure_ascii=False)
        print("Update complete.")
    except Exception as e:
        print(f"Error writing JSON file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    update_gps_from_excel()
