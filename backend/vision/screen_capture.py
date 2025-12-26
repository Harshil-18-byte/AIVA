import mss
import numpy as np
import cv2

sct = mss.mss()

def capture_screen():
    monitor = sct.monitors[1]  # primary display
    img = sct.grab(monitor)
    frame = np.array(img)
    frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
    return frame
