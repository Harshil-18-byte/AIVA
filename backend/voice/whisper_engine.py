model = None


def get_model():
    global model
    if model is None:
        try:
            import whisper

            print("Loading Whisper model...")
            model = whisper.load_model("small")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
            raise e
    return model


def transcribe(audio, sr):
    # Whisper expects 16k float32
    # If using API with array, no temp file needed
    try:
        m = get_model()
        # Assuming audio is already float32 valid array
        result = m.transcribe(audio, fp16=False)
        text = result["text"].strip()
        print(f"Transcribed: {text}")
        return text
    except Exception as e:
        print(f"Whisper inference error: {e}")
        return ""


def transcribe_file(file_path):
    try:
        import librosa

        # Load with librosa to ensure we get 16khz mono float32 array
        # This bypasses ffmpeg requirement for opening the file if librosa/soundfile can handle it
        audio, _ = librosa.load(file_path, sr=16000)

        m = get_model()
        result = m.transcribe(audio, fp16=False)
        return result
    except Exception as e:
        print(f"Transcribe error: {e}, attempting direct file load")
        # Fallback
        try:
            m = get_model()
            return m.transcribe(file_path, fp16=False)
        except Exception as e2:
            print(f"Fallback transcribe failed: {e2}")
            return {"text": ""}
