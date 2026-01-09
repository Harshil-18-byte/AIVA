import { loadPermissions, savePermissions } from "./permissions";
import { useState } from "react";

export default function PrivacyPanel() {
  const [perm, setPerm] = useState(loadPermissions());

  function toggle(k: string) {
    const updated = { ...perm, [k]: !perm[k] };
    setPerm(updated);
    savePermissions(updated);
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Privacy & Permissions</h3>
      {Object.keys(perm).map(k => (
        <label key={k} style={{ display: "block", marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={perm[k]}
            onChange={() => toggle(k)}
          />{" "}
          {k.toUpperCase()}
        </label>
      ))}
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        All processing is local. Nothing is uploaded.
      </p>
    </div>
  );
}
