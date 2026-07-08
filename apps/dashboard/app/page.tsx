"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { brand } from "@astraguard/ui/tokens";

/** Trust score explorer — entry point for looking up a Stellar project. */
export default function ExplorerPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/project/${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ color: brand.teal }}>Explore trust scores</h1>
      <p style={{ color: brand.slate }}>
        Look up any Stellar project by contract ID or asset code to see its live trust score,
        verification breakdown, and insurance coverage status.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Contract ID or asset code"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 6,
            border: `1px solid ${brand.slate}`
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            background: brand.teal,
            color: "white",
            fontWeight: 600
          }}
        >
          Search
        </button>
      </form>
    </main>
  );
}
