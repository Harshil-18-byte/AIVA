import { useState } from "react";
import Indicators from "./components/Indicators";
import FloatingButton from "./components/FloatingButton";
import Panel from "./components/Panel";

export default function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [listening, setListening] = useState(false);
  const [gestures, setGestures] = useState(false);

  return (
    <div>
      <Indicators listening={listening} gestures={gestures} />
      <FloatingButton onClick={() => setOpen(!open)} />
      {open && result && <Panel {...result} />}
    </div>
  );
}
