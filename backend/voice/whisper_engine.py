import whisper
import tempfile
import soundfile as sf

model = whisper.load_model("small")

def transcribe(audio, sr):
    with tempfile.NamedTemporaryFile(suffix=".wav") as f:
        sf.write(f.name, audio, sr)
        result = model.transcribe(f.name, fp16=False)
    return result["text"]
