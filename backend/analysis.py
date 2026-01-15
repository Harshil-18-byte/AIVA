import numpy as np
import os


def analyze_media(file_path):
    suggestions = []

    try:
        import cv2
        import soundfile as sf
    except ImportError:
        # If libs missing, just return empty list or basic info
        return []

    if not os.path.exists(file_path):
        return []

    # Check type
    ext = file_path.lower().split(".")[-1]
    is_video = ext in ["mp4", "mov", "avi", "mkv"]
    is_audio = ext in ["mp3", "wav", "aac", "m4a"]

    # 1. Audio Analysis (for both audio and video files)
    try:
        # soundfile is faster than librosa for just metadata/reading
        # But we want stats. Read first 30 seconds to be fast.
        data, sr = sf.read(file_path, stop=30 * 48000)
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)  # Convert to mono for analysis

        rms = np.sqrt(np.mean(data**2))
        db = 20 * np.log10(rms + 1e-9)

        if db < -40:
            suggestions.append(
                {
                    "id": "low_audio",
                    "title": "Fix Low Volume",
                    "description": f"Audio levels constitute silence ({db:.1f}dB)",
                    "action": "normalize_audio",
                }
            )
        elif db > -5:
            suggestions.append(
                {
                    "id": "clip_audio",
                    "title": "Fix Clipping",
                    "description": "Audio is peaking too high",
                    "action": "reduce_gain",
                }
            )
        else:
            # Basic spectral centroid checks could go here for "muffled" audio if we used librosa
            pass

    except Exception as e:
        print(f"Audio analysis failed: {e}")

    # 2. Video Analysis
    if is_video:
        try:
            cap = cv2.VideoCapture(file_path)
            if cap.isOpened():
                width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                fps = cap.get(cv2.CAP_PROP_FPS)

                # Check Resolution
                if width < 1280:
                    suggestions.append(
                        {
                            "id": "upscale",
                            "title": "Upscale Video",
                            "description": f"Low resolution ({int(width)}x{int(height)}) detected",
                            "action": "upscale_ai",
                        }
                    )

                # Check Shaky Footage / Brightness (sample a few frames)
                # Read 10th frame
                cap.set(cv2.CAP_PROP_POS_FRAMES, 10)
                ret, frame = cap.read()
                if ret:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    brightness = np.mean(gray)

                    if (
                        brightness < 60
                    ):  # Increased threshold from 30 to 60 for more sensitivity
                        suggestions.append(
                            {
                                "id": "brighten",
                                "title": "Auto-Exposure",  # Renamed for clarity
                                "description": "Optimize scene brightness",
                                "action": "color_boost",
                            }
                        )

                    # Add Color Grade suggestion if not dark
                    elif brightness > 60:
                        suggestions.append(
                            {
                                "id": "color_grade",
                                "title": "Auto Grade",
                                "description": "Apply cinematic look",
                                "action": "cinematic_grade",
                            }
                        )

                cap.release()

        except Exception as e:
            print(f"Video analysis failed: {e}")

    # --- ENSURE MINIMUM 5-7 SUGGESTIONS ---
    # Add contextual suggestions if count is low

    # Check 3: Silence Removal (Always useful for speech)
    if is_audio or is_video:
        suggestions.append(
            {
                "id": "silence_removal",
                "title": "Remove Silence",
                "description": "Trim pauses > 500ms",
                "action": "remove_silence",
            }
        )

    # Check 4: Subtitles (Always useful for speech)
    if is_audio or is_video:
        suggestions.append(
            {
                "id": "generate_captions",
                "title": "Auto Captions",
                "description": "Generate subtitles",
                "action": "transcribe",
            }
        )

    # Check 5: Stabilization (Assume handheld for video)
    if is_video:
        suggestions.append(
            {
                "id": "stabilize",
                "title": "Stabilize",
                "description": "Reduce camera shake",
                "action": "stabilize_video",
            }
        )

    # Check 6: Frame Re-centering (Smart Crop)
    if is_video:
        suggestions.append(
            {
                "id": "smart_crop",
                "title": "Smart Frame",
                "description": "Keep subject centered",
                "action": "smart_crop",
            }
        )

    # Check 7: Background Cleanup
    if is_audio or is_video:
        suggestions.append(
            {
                "id": "voice_isolation",
                "title": "Voice Isolation",
                "description": "Remove background noise",
                "action": "enhance_audio",
            }
        )

    # Ensure unique and limit to useful set if too many, avoiding duplicates
    # Simple dedupe by ID
    unique_suggestions = {s["id"]: s for s in suggestions}.values()
    suggestions = list(unique_suggestions)

    # Fallback / Default suggestions if nothing specific found
    if not suggestions:
        suggestions.append(
            {
                "id": "smart_enhance",
                "title": "Smart Enhance",
                "description": "AI auto-optimization",
                "action": "smart_enhance",
            }
        )

    return suggestions
