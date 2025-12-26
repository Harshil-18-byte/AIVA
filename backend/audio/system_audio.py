import sounddevice as sd
import numpy as np

def record_system_audio(duration=2, samplerate=44100):
    devices = sd.query_devices()
    loopback = None

    for i, d in enumerate(devices):
        if "Stereo Mix" in d["name"] or d["hostapi"] == 0:
            loopback = i
            break

    if loopback is None:
        raise RuntimeError("No loopback device found")

    audio = sd.rec(
        int(duration * samplerate),
        samplerate=samplerate,
        channels=2,
        device=loopback,
        dtype="float32"
    )
    sd.wait()
    return audio
