type EventName =
  | "open_panel"
  | "apply_suggestion"
  | "voice_command"
  | "gesture_used";

export function track(event: EventName) {
  const key = "aiva_analytics";
  const data = JSON.parse(localStorage.getItem(key) || "{}");

  data[event] = (data[event] || 0) + 1;

  localStorage.setItem(key, JSON.stringify(data));
}

export function getAnalytics() {
  return JSON.parse(localStorage.getItem("aiva_analytics") || "{}");
}
