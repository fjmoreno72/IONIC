import tkinter as tk
from tkinter import ttk
import json
from pathlib import Path


class RequirementsTreeView(tk.Tk):
    def __init__(self, organized_data):
        super().__init__()

        self.title("IOCORE2 SREQ to Test Cases Viewer")
        self.geometry("1920x1080")
        self.configure(bg="white")  # Set a background color for the window

        # Define color scheme for the levels
        self.level_colors = {
            "SI": "#1976D2",  # Corporate Blue for SI level
            "TIN": "#2E7D32",  # Forest Green for TIN level
            "SREQ": "#6A1B9A",  # Regal Purple for SREQ level
            "TEST": "#FFB74D"  # Burnt Orange for test cases
        }

        # Warning colors for zero counts (excluding TEST level)
        self.warning_colors = {level: "#ef5350" for level in ["SI", "TIN", "SREQ"]}

        # Configure the Treeview style
        self.style = ttk.Style(self)
        self.style.configure("Custom.Treeview",
                             background="white",
                             foreground="black",
                             rowheight=30,
                             fieldbackground="white")
        self.style.map("Custom.Treeview",
                       background=[("selected", "#e1e1e1")],
                       foreground=[("selected", "black")])

        # Create the main frame
        self.main_frame = ttk.Frame(self, padding=10)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # TreeView widget with a scrollbar
        self.tree = ttk.Treeview(self.main_frame, style="Custom.Treeview", selectmode="browse", columns=("name"))
        self.tree.column("#0", width=30, stretch=False)  # Tree structure column
        self.tree.column("name", width=1880, stretch=True)
        self.tree.heading("#0", text="")
        self.tree.heading("name", text="Requirements Hierarchy")
        self.tree.pack(fill=tk.BOTH, expand=True, side=tk.LEFT)

        self.scrollbar = ttk.Scrollbar(self.main_frame, orient="vertical", command=self.tree.yview)
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.configure(yscrollcommand=self.scrollbar.set)

        # Configure tags for different levels
        for level in self.level_colors:
            self.tree.tag_configure(level, background=self.level_colors[level], foreground="white")
        for level in self.warning_colors:
            self.tree.tag_configure(f"{level}_warning", background=self.warning_colors[level], foreground="white")

        # Populate the tree with the provided data
        self.populate_tree(organized_data)

    def count_children(self, data):
        """Recursively count all children in the data structure."""
        if isinstance(data, dict):
            if 'sreq_name' in data:  # SREQ level
                return len(data.get('test_cases', []))
            return sum(self.count_children(value) for value in data.values())
        return 1

    def populate_tree(self, organized_data):
        """Populate the TreeView with hierarchical data."""
        for (si_number, si_name), tin_groups in organized_data.items():
            # SI level
            si_count = self.count_children(tin_groups)
            si_tag = "SI_warning" if si_count == 0 else "SI"
            si_id = self.tree.insert("", "end", text=" ", values=(f"{si_number} -> {si_name} ({si_count})",), tags=(si_tag,))

            for (tin_number, ep_name), sreqs in tin_groups.items():
                # TIN level
                tin_count = self.count_children(sreqs)
                tin_tag = "TIN_warning" if tin_count == 0 else "TIN"
                tin_id = self.tree.insert(si_id, "end", text=" ", values=(f"     {tin_number} -> {ep_name} ({tin_count})",), tags=(tin_tag,))

                for sreq_number, sreq_data in sreqs.items():
                    # SREQ level
                    test_count = len(sreq_data.get('test_cases', []))
                    sreq_tag = "SREQ_warning" if test_count == 0 else "SREQ"
                    sreq_id = self.tree.insert(tin_id, "end", text=" ", values=(f"         {sreq_number} -> {sreq_data['sreq_name']} ({test_count})",), tags=(sreq_tag,))

                    # Test Cases
                    for test_key, test_name in sorted(sreq_data.get('test_cases', [])):
                        self.tree.insert(sreq_id, "end", text=" ", values=(f"              {test_key} -> {test_name}",), tags=("TEST",))


def read_and_organize_requirements():
    """Read the JSON file and organize requirements hierarchically."""
    script_dir = Path(__file__).parent.absolute()
    input_path = script_dir / "static" / "SREQ.json"

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


def main():
    organized_data, message = read_and_organize_requirements()
    if organized_data is None:
        print(message)
        return

    app = RequirementsTreeView(organized_data)
    app.mainloop()


if __name__ == "__main__":
    main()