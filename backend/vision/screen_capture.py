import numpy as np


def capture_screen():
    try:
        import mss
        import cv2

        # ✅ Create MSS instance INSIDE the function
        with mss.mss() as sct:
            # Use monitors[1] if available, else monitors[0] (all)
            monitor = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
            img = sct.grab(monitor)

        frame = np.array(img)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
        return frame
    except Exception as e:
        print(f"Screen Capture Failed: {e}")
        return np.zeros((720, 1280, 3), dtype=np.uint8)
