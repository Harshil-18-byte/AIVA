import soundfile as sf
import numpy as np


def apply_effect(input_path, output_path, effect_type):
    # Load audio
    import librosa

    y, sr = librosa.load(input_path, sr=None)

    y_processed = y

    if effect_type == "chipmunk":
        # Pitch shift up 4 semitones
        y_processed = librosa.effects.pitch_shift(y, sr=sr, n_steps=4)

    elif effect_type == "monster":
        # Pitch shift down 4 semitones
        y_processed = librosa.effects.pitch_shift(y, sr=sr, n_steps=-4)

    elif effect_type == "alien":
        # Pitch shift up + slight echo/tremolo simulation (simple modulation)
        y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=2)
        # Simple modulation
        mod = np.sin(
            2 * np.pi * 10 * np.linspace(0, len(y_shifted) / sr, len(y_shifted))
        )
        y_processed = y_shifted * (0.5 + 0.5 * mod)

    elif effect_type == "robot":
        # Simple granular-style robot effect or just rigid quantization?
        # Let's try a constant low-frequency modulation (ring mod)
        # Ring modulation with 50Hz sine wave
        carrier = np.sin(2 * np.pi * 50 * np.linspace(0, len(y) / sr, len(y)))
        y_processed = y * carrier

    elif effect_type == "echo":
        # Simple delay
        delay_sec = 0.3
        delay_samples = int(delay_sec * sr)
        decay = 0.5
        y_delay = np.zeros_like(y)
        y_delay[delay_samples:] = y[:-delay_samples]
        y_processed = y + y_delay * decay

    # Normalize to prevent clipping
    max_val = np.max(np.abs(y_processed))
    if max_val > 0:
        y_processed = y_processed / max_val * 0.9

    # Determine if input is video (heuristic)
    import os
    import subprocess

    ext = os.path.splitext(input_path)[1].lower()
    is_video = ext in [".mp4", ".mov", ".mkv", ".webm", ".avi"]

    if is_video:
        # Save temp audio
        temp_audio = output_path + ".temp.wav"
        sf.write(temp_audio, y_processed, sr)

        # Merge with original video using ffmpeg
        # ffmpeg -i input_video -i new_audio -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output_video
        try:
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-i",
                temp_audio,
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                output_path,
            ]
            # specific strict flag often helps with mapping
            subprocess.run(
                cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
        except Exception as e:
            print(f"FFmpeg merge failed: {e}")
            # Fallback: write as audio-only file (will lose video, but actionable)
            # Ideally, we'd alert api.py to change extension, but we are stuck with output_path.
            sf.write(output_path, y_processed, sr)
        finally:
            if os.path.exists(temp_audio):
                os.remove(temp_audio)
    else:
        # Audio only
        sf.write(output_path, y_processed, sr)

    return True
