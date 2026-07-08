"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../../../lib/api";

/** Files a community report into the registry two-person-review workflow (ARCHITECTURE.md §2.3). */
export function ReportButton({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [evidence, setEvidence] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      apiClient.reportAddress({ address: contractId, category: "unspecified", evidence })
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
