export function isDemoMode() {
  return localStorage.getItem("AIVA_DEMO") === "true";
}

export function toggleDemoMode() {
  const current = isDemoMode();
  localStorage.setItem("AIVA_DEMO", (!current).toString());
}
