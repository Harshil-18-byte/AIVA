import sounddevice as sd  # type: ignore
from typing import List, Dict, Any
import numpy as np

def record_system_audio(duration: int = 2, samplerate: int = 44100) -> np.ndarray[Any, np.dtype[np.float32]]:
    devices: List[Dict[str, Any]] = sd.query_devices()  # type: ignore
    loopback = None

    for i, d in enumerate(devices): # type: ignore
        if "Stereo Mix" in d.get("name", "") or d.get("hostapi") == 0:
            loopback = i
            break

    if loopback is None:
        raise RuntimeError("No loopback device found")

    audio: np.ndarray[Any, np.dtype[np.float32]] = sd.rec(  # type: ignore
        int(duration * samplerate),
        samplerate=samplerate,
        channels=2,
        device=loopback,
        dtype="float32"
    )
    sd.wait()
    return np.asarray(audio, dtype=np.float32)