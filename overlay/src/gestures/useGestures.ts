export function useGestures(onGesture: (g: string) => void) {
  // pseudo mapping for v1 demo
  function detect(landmarks: any[]) {
    if (!landmarks) return;
    onGesture("SCRUB");
  }
  return { detect };
}
