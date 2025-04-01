import pandas as pd
import json
import os
import sys

# Define file paths relative to the script location or project root
# Assuming the script is run from the project root (IONIC2)
EXCEL_FILE_PATH = 'static/ASC/data/ServiceFunctionConfigurationQuestions.xlsx'
GPS_JSON_PATH = 'static/ASC/data/gps.json'
CONFIG_ITEM_JSON_PATH = 'static/ASC/data/configItem.json'

def load_gps_data(filepath):
    """Loads GP data from the JSON file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: GP JSON file not found at {filepath}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {filepath}")
        sys.exit(1)

def create_gp_name_to_id_map(gps_data):
    """Creates a mapping from GP name to GP ID."""
    gp_map = {}
    if isinstance(gps_data, list): # Assuming gps.json contains a list of GP objects
        for gp in gps_data:
            if isinstance(gp, dict) and 'name' in gp and 'id' in gp:
                 # Normalize name for comparison (lowercase, strip whitespace)
                gp_map[gp['name'].strip().lower()] = gp['id']
            else:
                 print(f"Warning: Skipping invalid GP entry in gps.json: {gp}")
    else:
        print(f"Warning: gps.json does not contain a list as expected. Found type: {type(gps_data)}")
    return gp_map

def load_excel_data(filepath):
    """Loads configuration questions from the Excel file."""
    try:
        # Specify sheet_name=0 to read the first sheet
        df = pd.read_excel(filepath, sheet_name=0)
        # Basic validation for expected columns
        expected_cols = ['Name', 'Asset Type', 'Default Value', 'Help Text', 'Configuration Answer Type', 'Answer Content']
        missing_cols = [col for col in expected_cols if col not in df.columns]
        if missing_cols:
            print(f"Error: Missing expected columns in Excel file ({filepath}): {', '.join(missing_cols)}")
            sys.exit(1)
        # Fill NaN values with empty strings or appropriate defaults
        df.fillna('', inplace=True)
        return df
    except FileNotFoundError:
        print(f"Error: Excel file not found at {filepath}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading Excel file {filepath}: {e}")
        sys.exit(1)

def load_existing_config_items(filepath):
    """Loads existing config items from the JSON file."""
    if not os.path.exists(filepath):
        return {} # Return empty dict if file doesn't exist (first run)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Ensure data is a dictionary keyed by 'Name'
            if isinstance(data, list):
                 # Convert list to dict keyed by 'Name' if needed
                 config_map = {}
                 for item in data:
                     if isinstance(item, dict) and 'Name' in item:
                         config_map[item['Name']] = item
                     else:
                         print(f"Warning: Skipping invalid item in existing {filepath}: {item}")
                 return config_map
            elif isinstance(data, dict):
                 return data # Assume it's already in the correct format {Name: {details}}
            else:
                 print(f"Warning: Invalid format in existing {filepath}. Expected dict or list of dicts. Starting fresh.")
                 return {}

    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {filepath}. Starting fresh.")
        return {}
    except Exception as e:
        print(f"Error reading existing config items file {filepath}: {e}. Starting fresh.")
        return {}


def process_excel_row(row, gp_name_to_id_map):
    """Processes a single row from the Excel DataFrame."""
    name = str(row.get('Name', '')).strip()
    if not name:
        return None # Skip rows without a Name

    asset_type_str = str(row.get('Asset Type', '')).strip()
    # Split Asset Types by comma (and potentially semicolon), strip whitespace
    asset_type_names = [at.strip() for at in asset_type_str.replace(';', ',').split(',') if at.strip()]

    asset_type_ids = []
    unmapped_asset_types = []

    for at_name in asset_type_names:
        at_name_lower = at_name.lower()
        if at_name_lower in gp_name_to_id_map:
            asset_type_ids.append(gp_name_to_id_map[at_name_lower])
        else:
            unmapped_asset_types.append(at_name)

    if unmapped_asset_types:
        print(f"Warning: Could not find GP IDs for Asset Types: {', '.join(unmapped_asset_types)} in item '{name}'")

    config_item = {
        "Name": name,
        "GenericProducts": asset_type_ids, # Store list of GP IDs
        "DefaultValue": str(row.get('Default Value', '')),
        "HelpText": str(row.get('Help Text', '')),
        "ConfigurationAnswerType": str(row.get('Configuration Answer Type', '')),
        "AnswerContent": str(row.get('Answer Content', ''))
        # Add other fields from Excel if needed
    }
    return config_item

def synchronize_config_items(excel_df, gps_data, existing_config_items):
    """Synchronizes config items based on Excel data and existing JSON."""
    gp_name_to_id_map = create_gp_name_to_id_map(gps_data)
    processed_items = {} # Store items processed from Excel, keyed by Name
    warnings = []

    print("Processing Excel data...")
    # Use a dictionary to aggregate data by Name
    aggregated_items = {}
    for index, row in excel_df.iterrows():
        # Process row to get potential item structure and mapped IDs for *this row*
        row_item = process_excel_row(row.to_dict(), gp_name_to_id_map)
        if row_item:
            item_name = row_item["Name"]
            # Get the GenericProduct IDs found in this specific row
            current_row_asset_ids = row_item["GenericProducts"]

            if item_name in aggregated_items:
                # Item exists, merge GenericProducts and update other fields from the current row
                existing_item = aggregated_items[item_name]
                # Combine existing GenericProducts with new ones from this row, ensuring uniqueness
                combined_asset_ids = list(set(existing_item["GenericProducts"] + current_row_asset_ids))
                existing_item["GenericProducts"] = combined_asset_ids
                # Update other fields based on the current (potentially last) row for this Name
                existing_item["DefaultValue"] = row_item["DefaultValue"]
                existing_item["HelpText"] = row_item["HelpText"]
                existing_item["ConfigurationAnswerType"] = row_item["ConfigurationAnswerType"]
                existing_item["AnswerContent"] = row_item["AnswerContent"]
            else:
                # First time seeing this item Name, add it
                aggregated_items[item_name] = row_item

    # Now 'aggregated_items' holds the combined data from Excel
    processed_items = aggregated_items
    print(f"Processed {len(processed_items)} unique items from Excel after aggregation.")

    final_config_items = {}
    excel_names = set(processed_items.keys())
    existing_names = set(existing_config_items.keys())

    new_names = excel_names - existing_names
    updated_names = excel_names.intersection(existing_names)
    missing_names = existing_names - excel_names

    # Add new items
    for name in new_names:
        final_config_items[name] = processed_items[name]
        print(f"Adding new item: '{name}'")

    # Update existing items
    for name in updated_names:
        final_config_items[name] = processed_items[name] # Overwrite with data from Excel
        # Optional: Add more sophisticated update logic if needed (e.g., compare fields)
        # print(f"Updating existing item: '{name}'") # Uncomment for verbose logging

    # Keep existing items that are no longer in Excel, but issue a warning
    for name in missing_names:
        warnings.append(f"Warning: Item '{name}' exists in JSON but not found in the latest Excel file.")
        final_config_items[name] = existing_config_items[name] # Keep the old item

    print("\nSynchronization Summary:")
    print(f"- New items added: {len(new_names)}")
    print(f"- Items updated: {len(updated_names)}")
    print(f"- Items missing from Excel (kept in JSON): {len(missing_names)}")

    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(warning)

    # Convert the final dictionary back to a list of objects for the JSON output
    # Sort by Name for consistency
    final_config_list = sorted(final_config_items.values(), key=lambda x: x.get('Name', ''))

    return final_config_list

def save_config_items(filepath, config_items_list):
    """Saves the config items list to the JSON file."""
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(config_items_list, f, indent=4, ensure_ascii=False)
        print(f"\nSuccessfully saved updated configuration items to {filepath}")
    except Exception as e:
        print(f"Error saving config items to {filepath}: {e}")
        sys.exit(1)

def main():
    print("Starting configuration item synchronization...")
    print(f"Reading GPS data from: {GPS_JSON_PATH}")
    gps_data = load_gps_data(GPS_JSON_PATH)

    print(f"Reading Excel data from: {EXCEL_FILE_PATH}")
    excel_df = load_excel_data(EXCEL_FILE_PATH)

    print(f"Reading existing config items from: {CONFIG_ITEM_JSON_PATH}")
    existing_config_items = load_existing_config_items(CONFIG_ITEM_JSON_PATH)
    print(f"Found {len(existing_config_items)} existing items.")

    print("Synchronizing data...")
    final_config_list = synchronize_config_items(excel_df, gps_data, existing_config_items)

    print(f"Saving {len(final_config_list)} items to: {CONFIG_ITEM_JSON_PATH}")
    save_config_items(CONFIG_ITEM_JSON_PATH, final_config_list)

    print("Synchronization complete.")

if __name__ == "__main__":
    main()
