export default function Panel({ text, intent, confidence, reason }: any) {
  return (
    <div style={{ background: "#161A22", padding: 12, borderRadius: 8, color: 'white' }}>
      {text && <p style={{ fontSize: 13, opacity: 0.8 }}>{text}</p>}
      <p><strong>Suggestion:</strong> {intent}</p>
      {reason && <p style={{ fontSize: 14 }}>{reason}</p>}
      {confidence && <p style={{ fontSize: 12, opacity: 0.6 }}>
        Confidence: {(confidence * 100).toFixed(0)}%
      </p>}
      <button style={{ marginTop: 8, padding: "4px 8px" }}>Apply</button>
    </div>
  );
}
