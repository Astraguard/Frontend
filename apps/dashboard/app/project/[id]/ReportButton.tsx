"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../../../lib/api";

/**
 * Categories supported by the backend triage/review workflow
 * (ARCHITECTURE.md §2.3). Keep in sync with astraguard-backend's
 * allowed values — once an OpenAPI spec is published this list should
 * be derived from generated types instead.
 */
export const REPORT_CATEGORIES = [
  { value: "scam", label: "Scam" },
  { value: "rug_pull", label: "Rug pull" },
  { value: "phishing", label: "Phishing" },
  { value: "fake_audit", label: "Fake audit" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]["value"];

/** Files a community report into the registry two-person-review workflow (ARCHITECTURE.md §2.3). */
export function ReportButton({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory>("scam");
  const [evidence, setEvidence] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.reportAddress({ address: contractId, category, evidence }),
  });

  if (mutation.isSuccess) {
    return <p>Report filed — an analyst will review it shortly.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
        Report this project
      </button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}
    >
      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={category}
        onChange={(event) => setCategory(event.target.value as ReportCategory)}
        required
      >
        {REPORT_CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label htmlFor="evidence">What happened? (evidence, links, tx hashes)</label>
      <textarea
        id="evidence"
        value={evidence}
        onChange={(event) => setEvidence(event.target.value)}
        rows={4}
        required
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
