from typing import List, Dict, Any
import numpy as np


def record_system_audio(
    duration: int = 2, samplerate: int = 44100
) -> np.ndarray:  # type: ignore
    try:
        import sounddevice as sd  # type: ignore

        devices: List[Dict[str, Any]] = sd.query_devices()  # type: ignore
        loopback = None

        for i, d in enumerate(devices):  # type: ignore
            if "Stereo Mix" in d.get("name", "") or d.get("hostapi") == 0:
                loopback = i
                break

        if loopback is None:
            # Fallback to default if no explicit loopback found, standard recording might work?
            # Or just raise
            pass

        audio = sd.rec(
            int(duration * samplerate),
            samplerate=samplerate,
            channels=2,
            device=loopback,
            dtype="float32",
        )
        sd.wait()
        return np.asarray(audio, dtype=np.float32)
    except Exception as e:
        print(f"System Audio Rec Failed: {e}")
        return np.zeros((int(duration * samplerate), 2), dtype=np.float32)
