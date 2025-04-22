import json
import uuid
import os

# Path to the ASC JSON file (from project root)
FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'app', 'static', 'ASC', 'data', '_ascs.json')


def add_guids():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for asc in data:
        asc['guid'] = str(uuid.uuid4())
        for gp in asc.get('gpInstances', []):
            gp['guid'] = str(uuid.uuid4())
            for sp in gp.get('spInstances', []):
                sp['guid'] = str(uuid.uuid4())

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"GUIDs added to {FILE_PATH}")


if __name__ == '__main__':
    add_guids()
