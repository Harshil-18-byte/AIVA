export type PermissionKey =
  | "screen"
  | "audio"
  | "microphone"
  | "camera"
  | "automation";

export const defaultPermissions: Record<PermissionKey, boolean> = {
  screen: false,
  audio: false,
  microphone: false,
  camera: false,
  automation: false
};

export function loadPermissions() {
  return JSON.parse(
    localStorage.getItem("aiva_permissions") ||
    JSON.stringify(defaultPermissions)
  );
}

export function savePermissions(p: Record<PermissionKey, boolean>) {
  localStorage.setItem("aiva_permissions", JSON.stringify(p));
}
