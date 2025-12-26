def parse_intent(text: str):
    t = text.lower()

    if "remove silence" in t:
        return "REMOVE_SILENCE"
    if "cut here" in t:
        return "CUT"
    if "play" in t:
        return "PLAY"
    if "pause" in t:
        return "PAUSE"
    if "undo" in t:
        return "UNDO"

    return "UNKNOWN"
