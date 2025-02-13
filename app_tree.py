from flask import Flask, render_template, jsonify
import json
from pathlib import Path

app = Flask(__name__)

def read_and_organize_requirements():
    """Read the JSON file and organize requirements hierarchically."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "static" / "SREQ.json"
    print("RELOAD DATA")
    try:
        with open(input_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        si_groups = {}
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
                    'test_cases': set()
                }

            # Add test case only if both key and name are not None
            if test_case[0] is not None and test_case[1] is not None:
                si_groups[si_key][tin_key][sreq_info[0]]['test_cases'].add(test_case)
        return si_groups, "Success"

    except FileNotFoundError:
        return None, f"Error: File not found at {input_path}"
    except json.JSONDecodeError:
        return None, "Error: Invalid JSON format in the input file"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

@app.route("/")
def index():
    """Render the index page with the organized data."""
    organized_data, message = read_and_organize_requirements()
    print("FILE IS READ 2 !!!")
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"

    return render_template("index_tree.html", data=organized_data)

@app.route("/api/data")
def get_data():
    """Provide the organized data as a JSON API."""
    organized_data, _ = read_and_organize_requirements()
    print("FILE IS READ !!!")
    return jsonify(organized_data)

if __name__ == "__main__":
    app.run(debug=True,port=5001)