from fastapi import FastAPI
from voice.whisper_engine import transcribe
from voice.intent import parse_intent
import numpy as np

app = FastAPI()

@app.post("/voice")
def voice(payload: dict):
    audio = np.array(payload["audio"], dtype=np.float32)
    text = transcribe(audio, payload["sr"])
    intent = parse_intent(text)
    return {"text": text, "intent": intent}
