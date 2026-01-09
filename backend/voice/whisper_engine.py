import whisper
import tempfile
import soundfile as sf
import datetime
import os

model = whisper.load_model("small")


def transcribe(audio, sr):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, audio, sr)
        temp_path = f.name

    result = model.transcribe(temp_path, fp16=False)
    os.remove(temp_path)
    return result


def format_timestamp(seconds: float):
    td = datetime.timedelta(seconds=seconds)
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    millis = int(td.microseconds / 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def generate_srt(segments):
    srt_content = ""
    for i, segment in enumerate(segments):
        start = format_timestamp(segment["start"])
        end = format_timestamp(segment["end"])
        text = segment["text"].strip()
        srt_content += f"{i+1}\n{start} --> {end}\n{text}\n\n"
    return srt_content
