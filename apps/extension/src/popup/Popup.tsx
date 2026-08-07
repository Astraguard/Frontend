import { useEffect, useState } from "react";
import { createAstraguardClient } from "@astraguard/api-client";
import type { TrustScore } from "@astraguard/api-client";
import { RiskBadge, brand } from "@astraguard/ui";
import { env } from "../env";

const client = createAstraguardClient({
  baseUrl: env.VITE_API_URL,
});

const SETTINGS_KEY = "astraguard:settings";

interface Settings {
  scanEnabled: boolean;
}

export function Popup() {
  const [query, setQuery] = useState("");
  const [score, setScore] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({ scanEnabled: true });

  useEffect(() => {
    chrome.storage.sync.get(SETTINGS_KEY).then((stored) => {
      if (stored[SETTINGS_KEY]) setSettings(stored[SETTINGS_KEY]);
    });
  }, []);

  function toggleScan() {
    const next = { ...settings, scanEnabled: !settings.scanEnabled };
    setSettings(next);
    chrome.storage.sync.set({ [SETTINGS_KEY]: next });
  }

  async function lookupScore() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      setScore(await client.getScore(query.trim()));
    } catch {
      setScore(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 16, color: brand.teal, margin: "0 0 12px" }}>Astraguard</h1>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Contract ID or asset"
          style={{ flex: 1, padding: "6px 8px" }}
        />
        <button type="button" onClick={lookupScore} disabled={loading}>
          {loading ? "…" : "Check"}
        </button>
      </div>

      {score && (
        <div style={{ marginTop: 12 }}>
          <RiskBadge verdict={score.verdict} score={score.score} />
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={settings.scanEnabled} onChange={toggleScan} />
        Scan transactions before signing
      </label>
    </div>
  );
}
