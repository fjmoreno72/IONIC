import pandas as pd
import json

def parse_sreq(sreq_text):
    """Parse SREQ text to extract number and name."""
    # First try to split by colon
    parts = sreq_text.split(':', 1)
    if len(parts) == 2:
        sreq_num = standardize_sreq_format(parts[0].strip())
        return sreq_num, parts[1].strip()
    
    # If no colon, try to match SP5-SREQ-XXX pattern and split by first space after it
    import re
    match = re.match(r'(SP5-SREQ-\d+)\s+(.*)', sreq_text)
    if match:
        return match.group(1), match.group(2)
    
    # Try to match SREQ-XXX or SREQ.XXX pattern
    match = re.match(r'SREQ[-.](\d+)(.*)', sreq_text)
    if match:
        sreq_num = f"SP5-SREQ-{match.group(1)}"
        description = match.group(2).strip()
        return sreq_num, description
    
    # If we get here, try to extract just the number and standardize
    match = re.search(r'\d+', sreq_text)
    if match:
        sreq_num = f"SP5-SREQ-{match.group(0)}"
        remaining = re.sub(r'\d+', '', sreq_text, 1).strip()
        return sreq_num, remaining
    
    return sreq_text, ""  # Fallback if no pattern matches

def standardize_sreq_format(sreq_text):
    """Convert any SREQ format to SP5-SREQ-XXX format."""
    import re
    # If already in SP5-SREQ-XXX format, return as is
    if re.match(r'SP5-SREQ-\d+', sreq_text):
        return sreq_text
    
    # Extract the number from SREQ-XXX or SREQ.XXX format
    match = re.search(r'\d+', sreq_text)
    if match:
        return f"SP5-SREQ-{match.group(0)}"
    
    return sreq_text

def excel_to_json():
    try:
        # Read the Excel file
        excel_file = './static/SP5-Functional.xlsx'
        df = pd.read_excel(excel_file)
        
        # Forward fill the null values in Services column
        df['Services'] = df['Services'].ffill()
       # Forward fill the null values in Funtion column
        df['Function'] = df['Function'].ffill() 
        # Create a list to store all entries
        result = []
        
        # Process each row
        for _, row in df.iterrows():
            if pd.notna(row['SREQS']):
                service = row['Services']
                function = row['Function']
                sreq_number, sreq_name = parse_sreq(row['SREQS'])
                
                entry = {
                    "siName": service,
                    "funName": function,
                    "sreqNumber": sreq_number,
                    "sreqName": sreq_name
                }
                result.append(entry)
        
        # Save to a JSON file
        output_file = './static/SP5-Functional.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=4, ensure_ascii=False)
            
        print(f"Successfully converted Excel to JSON. Output saved to: {output_file}")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    excel_to_json()
