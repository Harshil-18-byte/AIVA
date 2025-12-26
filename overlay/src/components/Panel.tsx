export default function Panel({ text, intent, confidence, reason }: any) {
  return (
    <div style={{ padding: 12 }}>
      <p><strong>Suggestion:</strong> {intent}</p>
      <p>{reason}</p>
      <p style={{ fontSize: 12 }}>
        Confidence: {(confidence * 100).toFixed(0)}%
      </p>
      <button>Apply</button>
    </div>
  );
}
