import pandas as pd
import json
import os
import re

# Define file paths relative to the script's location or project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINK_TYPES_PATH = os.path.join(BASE_DIR, 'app', 'static', 'ASC', 'data', 'LinkTypes.xlsx')
SERVICE_FUNCTIONS_PATH = os.path.join(BASE_DIR, 'app', 'static', 'ASC', 'data', 'ServiceFunctions.xlsx')
GPS_JSON_PATH = os.path.join(BASE_DIR, 'app', 'static', 'ASC', 'data', 'gps.json')
LINK_CI_QUESTIONS_PATH = os.path.join(BASE_DIR, 'app', 'static', 'ASC', 'data', 'LinkTypeConfigurationQuestionsOverview.xlsx')
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, 'app', 'static', 'ASC', 'data', 'links.json')

# --- Helper Functions ---
def generate_link_id(index):
    """Generates a unique link ID in the format LNK-XXXX."""
    return f"LNK-{index:04d}"

def parse_keys(key_string):
    """Parses comma or space-separated keys from a string."""
    if pd.isna(key_string):
        return []
    keys = [key.strip() for key in re.split(r'[,\s]+', str(key_string)) if key.strip()]
    return keys

def parse_asset_types(asset_string):
    """Parses comma or newline-separated asset types from a string."""
    if pd.isna(asset_string):
        return []
    assets = [asset.strip() for asset in re.split(r'[,\n]+', str(asset_string)) if asset.strip()]
    return assets

def get_gps_ids_for_sf_keys(sf_keys, sf_key_to_assets_map, asset_to_gp_map):
    """Finds GP IDs associated with a list of Service Function keys."""
    all_gps_ids = set()
    for key in sf_keys:
        asset_types = sf_key_to_assets_map.get(key, [])
        if not asset_types:
            pass
        for asset_type in asset_types:
            gp_id = asset_to_gp_map.get(asset_type)
            if gp_id:
                all_gps_ids.add(gp_id)
            else:
                print(f"Warning: GP ID not found for Asset Type '{asset_type}' linked to Service Function Key '{key}'")
    return sorted(list(all_gps_ids))

# --- Main Processing Logic ---
def process_data():
    """Reads input files, processes data, generates links.json, and adds linkCIs."""
    try:
        # === Part 1: Generate Initial Links (as before) ===
        print("--- Starting Part 1: Generating Initial Links ---")

        # 1. Load ServiceFunctions.xlsx
        print(f"Loading Service Functions from: {SERVICE_FUNCTIONS_PATH}")
        sf_df = pd.read_excel(SERVICE_FUNCTIONS_PATH, engine='openpyxl')
        sf_key_col = 'Key'
        info_source_col = 'Information Sources'
        asset_col = 'Asset Types'
        required_sf_cols = [sf_key_col, info_source_col, asset_col]
        missing_sf_cols = [col for col in required_sf_cols if col not in sf_df.columns]
        if missing_sf_cols:
            raise ValueError(f"Missing required columns in ServiceFunctions.xlsx: {missing_sf_cols}. Found: {list(sf_df.columns)}")

        sf_key_to_assets_map = {}
        processed_keys_count = 0
        filtered_out_keys_count = 0
        for index, row in sf_df.iterrows():
            sf_key = str(row[sf_key_col]).strip() if pd.notna(row[sf_key_col]) else None
            info_source = str(row[info_source_col]).strip() if pd.notna(row[info_source_col]) else None
            asset_types_str = row[asset_col]
            if not sf_key: continue
            if info_source == 'SP3':
                filtered_out_keys_count += 1
                continue
            asset_types = parse_asset_types(asset_types_str)
            if asset_types:
                 sf_key_to_assets_map[sf_key] = asset_types
                 processed_keys_count += 1
        print(f"Processed {processed_keys_count} service function keys (filtered out {filtered_out_keys_count} keys with Info Source 'SP3').")

        # 2. Load gps.json
        print(f"Loading GP data from: {GPS_JSON_PATH}")
        try:
            with open(GPS_JSON_PATH, 'r', encoding='utf-8') as f:
                gps_data = json.load(f)
        except Exception as e:
             print(f"Error loading or parsing {GPS_JSON_PATH}: {e}")
             raise
        asset_to_gp_map = {gp['name'].strip(): gp['id'] for gp in gps_data if isinstance(gp, dict) and 'name' in gp and 'id' in gp}
        print(f"Loaded {len(asset_to_gp_map)} asset type to GP ID mappings.")

        # 3. Load LinkTypes.xlsx and create initial link list
        print(f"Loading Link Types from: {LINK_TYPES_PATH}")
        lt_df = pd.read_excel(LINK_TYPES_PATH, engine='openpyxl')
        name_col = 'Name'
        desc_col = 'Description'
        sf_a_col = 'Service Function Side A'
        sf_b_col = 'Service Function Side B'
        required_lt_cols = [name_col, desc_col, sf_a_col, sf_b_col]
        missing_lt_cols = [col for col in required_lt_cols if col not in lt_df.columns]
        if missing_lt_cols:
             raise ValueError(f"Missing required columns in LinkTypes.xlsx: {missing_lt_cols}. Found: {list(lt_df.columns)}")

        initial_links = []
        link_counter = 1
        for index, row in lt_df.iterrows():
            link_name = str(row[name_col]).strip() if pd.notna(row[name_col]) else f"Unnamed Link {link_counter}"
            link_desc = str(row[desc_col]).strip() if pd.notna(row[desc_col]) else ""
            sf_keys_a = parse_keys(row[sf_a_col])
            sf_keys_b = parse_keys(row[sf_b_col])
            if not sf_keys_a: print(f"Warning: No valid SF Keys for Side A in Link '{link_name}' (Row {index + 2})")
            if not sf_keys_b: print(f"Warning: No valid SF Keys for Side B in Link '{link_name}' (Row {index + 2})")
            gps_side_a = get_gps_ids_for_sf_keys(sf_keys_a, sf_key_to_assets_map, asset_to_gp_map)
            gps_side_b = get_gps_ids_for_sf_keys(sf_keys_b, sf_key_to_assets_map, asset_to_gp_map)
            link_entry = {
                "id": generate_link_id(link_counter),
                "name": link_name,
                "description": link_desc,
                "gps_side_a": gps_side_a,
                "gps_side_b": gps_side_b
            }
            initial_links.append(link_entry)
            link_counter += 1
        print(f"Generated {len(initial_links)} initial links.")
        print("--- Finished Part 1 ---")

        # === Part 2: Add Link CIs ===
        print("\n--- Starting Part 2: Adding Link Configuration Items (linkCIs) ---")

        # 1. Load LinkTypeConfigurationQuestionsOverview.xlsx
        print(f"Loading Link CI Questions from: {LINK_CI_QUESTIONS_PATH}")
        try:
            ci_df = pd.read_excel(LINK_CI_QUESTIONS_PATH, engine='openpyxl')
        except FileNotFoundError:
            print(f"Error: Link CI Questions file not found at {LINK_CI_QUESTIONS_PATH}")
            # Decide whether to proceed without CIs or raise error
            # Option: Proceed without CIs
            print("Warning: Proceeding without adding linkCIs as the questions file was not found.")
            ci_df = pd.DataFrame() # Empty dataframe
            # Option: Raise error (uncomment below)
            # raise
        except Exception as e:
            print(f"Error loading {LINK_CI_QUESTIONS_PATH}: {e}")
            raise

        # Define required columns for LinkTypeConfigurationQuestionsOverview.xlsx
        ci_link_type_col = 'Link Type'
        ci_name_col = 'Name'
        ci_help_col = 'Help Text'
        ci_default_col = 'Default Value'
        ci_answer_type_col = 'Answer Type'
        ci_answer_content_col = 'Answer Content'

        required_ci_cols = [ci_link_type_col, ci_name_col, ci_help_col, ci_default_col, ci_answer_type_col, ci_answer_content_col]
        found_ci_cols = list(ci_df.columns) if not ci_df.empty else []
        missing_ci_cols = [col for col in required_ci_cols if col not in found_ci_cols]

        if not ci_df.empty and missing_ci_cols:
            # Only raise error if the file was loaded but columns are missing
             raise ValueError(f"Missing required columns in {os.path.basename(LINK_CI_QUESTIONS_PATH)}: {missing_ci_cols}. Found: {found_ci_cols}")

        # 2. Group CI questions by 'Link Type'
        link_type_to_cis_map = {}
        if not ci_df.empty:
            for _, row in ci_df.iterrows():
                link_type = str(row[ci_link_type_col]).strip() if pd.notna(row[ci_link_type_col]) else None
                if not link_type: continue # Skip rows without a Link Type

                ci_entry = {
                    "Name": str(row[ci_name_col]).strip() if pd.notna(row[ci_name_col]) else "",
                    "Help Text": str(row[ci_help_col]).strip() if pd.notna(row[ci_help_col]) else "",
                    "Default Value": str(row[ci_default_col]).strip() if pd.notna(row[ci_default_col]) else "",
                    "Answer Type": str(row[ci_answer_type_col]).strip() if pd.notna(row[ci_answer_type_col]) else "",
                    "Answer Content": str(row[ci_answer_content_col]).strip() if pd.notna(row[ci_answer_content_col]) else "",
                    "Apply A/B": "Both" # Default as requested
                }

                if link_type not in link_type_to_cis_map:
                    link_type_to_cis_map[link_type] = []
                link_type_to_cis_map[link_type].append(ci_entry)
            print(f"Processed {len(link_type_to_cis_map)} unique Link Types from CI questions file.")
        else:
             print("Skipping CI processing as the questions file was empty or not found.")


        # 3. Add 'linkCIs' to each link in the initial list
        final_links = []
        cis_added_count = 0
        for link in initial_links:
            link_name = link['name']
            # Find corresponding CIs based on link name matching Link Type
            link_cis = link_type_to_cis_map.get(link_name, [])
            if link_cis:
                cis_added_count += 1
            # Add the linkCIs list (even if empty)
            link['linkCIs'] = link_cis
            final_links.append(link)

        print(f"Added linkCIs to {cis_added_count} links based on matching names.")
        print("--- Finished Part 2 ---")


        # 4. Write the final combined output to links.json
        print(f"\nWriting final output with linkCIs to: {OUTPUT_JSON_PATH}")
        os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
        with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(final_links, f, indent=2)

        print(f"Successfully generated final {os.path.basename(OUTPUT_JSON_PATH)} with linkCIs.")

    except FileNotFoundError as e:
        print(f"Error: Input file not found - {e}")
    except ValueError as e:
        print(f"Error: Data processing issue or missing columns - {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

# --- Execution ---
if __name__ == "__main__":
    print(f"Running script from directory: {os.getcwd()}")
    print(f"Project base directory identified as: {BASE_DIR}")
    process_data()
