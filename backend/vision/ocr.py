import pytesseract
import cv2
from typing import Any
import numpy as np
from numpy.typing import NDArray

def extract_text(frame: Any) -> str:
    gray: NDArray[np.uint8] = np.asarray(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), dtype=np.uint8)
    _, gray_thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    gray = np.asarray(gray_thresh, dtype=np.uint8)

    text: str = pytesseract.image_to_string(gray)
    return text.strip()