import numpy as np
import soundfile as sf
import os


def normalize_audio(input_path: str, output_path: str):
    data, samplerate = sf.read(input_path)
    # Peak normalization to -1dB
    peak = np.max(np.abs(data))
    if peak > 0:
        normalized = data * (0.9 / peak)
        sf.write(output_path, normalized, samplerate)
    return output_path


def detect_silence(data, samplerate, threshold=0.01, min_silence_len=0.5):
    # Basic silence detection logic
    abs_data = np.abs(data)
    if len(abs_data.shape) > 1:
        abs_data = np.mean(abs_data, axis=1)

    is_silent = abs_data < threshold
    # Simplified: return ratio
    return np.mean(is_silent)


def remove_silence(input_path: str, output_path: str, threshold=0.01):
    data, samplerate = sf.read(input_path)
    abs_data = np.abs(data)
    if len(abs_data.shape) > 1:
        abs_data_mono = np.mean(abs_data, axis=1)
    else:
        abs_data_mono = abs_data

    mask = abs_data_mono > threshold
    processed = data[mask]
    sf.write(output_path, processed, samplerate)
    return output_path
