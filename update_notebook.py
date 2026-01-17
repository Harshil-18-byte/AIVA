import os
import json

ROOT_DIR = r"c:\AIVA"
NOTEBOOK_PATH = os.path.join(ROOT_DIR, ".ipynb")

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".venv",
    "dist",
    "__pycache__",
    ".ipynb_checkpoints",
}
EXCLUDE_FILES = {"package-lock.json", "error.log"}
INCLUDE_EXTS = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".css",
    ".html",
    ".md",
    ".bat",
    ".json",
    ".txt",
}


def get_project_content():
    lines = ["# Project Codebase Dump\n\n"]
    for root, dirs, files in os.walk(ROOT_DIR):
        # Modify dirs in-place to skip excluded
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file == ".ipynb":
                continue  # Skip the notebook itself
            if file in EXCLUDE_FILES:
                continue

            ext = os.path.splitext(file)[1]
            if ext not in INCLUDE_EXTS:
                continue

            path = os.path.join(root, file)
            rel_path = os.path.relpath(path, ROOT_DIR)

            lines.append(f"## File: {rel_path}\n")
            lines.append(f"```{ext.lstrip('.')}\n")

            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    lines.append(content + "\n")
            except Exception as e:
                lines.append(f"# Error reading file: {e}\n")

            lines.append("```\n\n")
    return lines


def update_notebook():
    if not os.path.exists(NOTEBOOK_PATH):
        print(f"Notebook not found at {NOTEBOOK_PATH}")
        return

    try:
        with open(NOTEBOOK_PATH, "r", encoding="utf-8") as f:
            nb = json.load(f)

        project_lines = get_project_content()

        new_cell = {"cell_type": "markdown", "metadata": {}, "source": project_lines}

        nb["cells"].append(new_cell)

        with open(NOTEBOOK_PATH, "w", encoding="utf-8") as f:
            json.dump(nb, f, indent=1)

        print("Notebook updated successfully.")

    except Exception as e:
        print(f"Error updating notebook: {e}")


if __name__ == "__main__":
    update_notebook()
