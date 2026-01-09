import { useEffect } from "react";

export default function useShortcuts(actions: {
  toggleAIVA: () => void;
  toggleVoice: () => void;
  toggleGestures: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.ctrlKey || !e.shiftKey) return;

      switch (e.key.toLowerCase()) {
        case "a":
          actions.toggleAIVA();
          break;
        case "v":
          actions.toggleVoice();
          break;
        case "g":
          actions.toggleGestures();
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
