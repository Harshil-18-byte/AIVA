import json
import os

# Get the directory of this script (c:\AIVA\scripts)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Root is one level up (c:\AIVA)
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
NOTEBOOK_PATH = os.path.join(ROOT_DIR, "AIVA.ipynb")

# 1. Load existing notebook to preserve original content
with open(NOTEBOOK_PATH, "r", encoding="utf-8") as f:
    nb = json.load(f)

# 2. Extract original cells (exclude previously added code dumps)
original_cells = []
for cell in nb["cells"]:
    source = "".join(cell.get("source", []))
    # Heuristic to detect the code dump cell I added previously
    if "# Project Codebase Dump" in source or "file:///c:/AIVA/" in source:
        continue
    # Keep the original Scene Detection content
    original_cells.append(cell)

# 3. Create General Project Intro Cells
intro_cells = [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# AIVA: AI Video Assistant & Editor\n",
            "\n",
            "## Executive Summary\n",
            "AIVA is a privacy-first, desktop-based video editing assistant. It combines a traditional **Non-Linear Editor (NLE)** interface (built with React + Electron) with a powerful local AI backend (Python + FastAPI). \n",
            "\n",
            "### Core Philosophy\n",
            "1.  **Local-First / Privacy**: No video data ever leaves the user's machine. All inference (Whisper, Computer Vision) runs on `localhost`.\n",
            "2.  ** multimodal Interaction**: Beyond mouse and keyboard, AIVA supports **Voice Commands** and **Hand Gestures** to keep the creative flow uninterrupted.\n",
            "3.  **Active Assistance**: AIVA doesn't just wait for commands; it actively analyzes footage (Smart Scene Detection) and suggests improvements.\n",
            "\n",
            "---\n",
        ],
    }
]

# 4. Create Tech Deep Dive Cells (Voice/Vision specifics that weren't in the original Scene Detection report)
tech_cells = [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "---\n",
            "# Additional AI Capabilities\n",
            "\n",
            "Beyond Scene Detection, AIVA implements several other intelligence modules:\n",
            "\n",
            "## 1. Voice Command Engine\n",
            "The system uses a strictly typed intent parser (`backend/voice/intent.py`) coupled with **OpenAI Whisper**. \n",
            "The flow is: `Audio Query -> Whisper (STT) -> Text -> Keyword Matching -> Executable Action`.\n",
            "\n",
            "Supported Intents include:\n",
            '*   **Transport**: "Play", "Pause", "Cut here"\n',
            '*   **Editing**: "Remove silence", "Delete this clip"\n',
            '*   **Color**: "Make it look cinematic" (Values mapped in `backend/voice/intent.py`)\n',
            "\n",
            "## 2. Vision & Context\n",
            "The `backend/vision/` module handles screen context extraction:\n",
            "*   **OCR**: Uses Tesseract to read text from video frames or UI elements.\n",
            "*   **Gestures**: (Roadmap) MediaPipe integration for hand-tracking.\n",
        ],
    }
]

# 5. Generate Comprehensive Codebase Dump
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".venv",
    "dist",
    "__pycache__",
    ".ipynb_checkpoints",
    "typings",
    ".vscode",
}
EXCLUDE_FILES = {"package-lock.json", "error.log"}
# We are making a DETAILED notebook, so we include all source files.
INCLUDE_EXTS = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    # ".css", # Exclude CSS to save space
    # ".html", # Exclude HTML
    ".md",
    # ".bat",
    # ".json", # Exclude JSON
    # ".txt",
}

code_header = {
    "cell_type": "markdown",
    "metadata": {},
    "source": [
        "---\n",
        "# Appendix: Complete Project Source Code\n",
        "Below is the complete, auto-generated documentation of the implementation details, organized by file.\n",
    ],
}

code_cells = []

# Walk through files
for root, dirs, files in os.walk(ROOT_DIR):
    # Sort for consistent order
    dirs.sort()
    files.sort()

    # Filter directories
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

    for file in files:
        if file.endswith(".ipynb") or file.endswith("rebuild_notebook.py"):
            continue
        if file in EXCLUDE_FILES:
            continue

        ext = os.path.splitext(file)[1]
        if ext not in INCLUDE_EXTS:
            continue

        path = os.path.join(root, file)
        rel_path = os.path.relpath(path, ROOT_DIR)

        # Read content
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()

            MAX_LINES = 150
            if len(lines) > MAX_LINES:
                content = (
                    "".join(lines[:MAX_LINES])
                    + f"\n\n... (Truncated. Total lines: {len(lines)}) ..."
                )
            else:
                content = "".join(lines)

            lang_map = {
                ".py": "python",
                ".ts": "typescript",
                ".tsx": "typescript",
                ".js": "javascript",
                ".html": "html",
                ".css": "css",
                ".md": "markdown",
                ".json": "json",
            }
            lang = lang_map.get(ext, "")

            # Create a collapsible Markdown cell for this file
            cell_source = [
                f"<details>\n",
                f"<summary>📄 <b>{rel_path}</b></summary>\n\n",
                f"```{lang}\n",
                content,
                "\n```\n",
                "</details>\n",
            ]

            code_cells.append(
                {"cell_type": "markdown", "metadata": {}, "source": cell_source}
            )

        except Exception as e:
            print(f"Skipping {rel_path}: {e}")

# 6. Assemble Final Notebook
# Order: Intro -> Original Scene Detection Report -> New Tech -> Code Dump
final_cells = intro_cells + original_cells + tech_cells + [code_header] + code_cells

nb["cells"] = final_cells

# 7. Write Result
with open(NOTEBOOK_PATH, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)

print(f"Notebook rebuilt with {len(final_cells)} cells.")
