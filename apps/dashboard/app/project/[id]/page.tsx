"use client";

import { useQuery } from "@tanstack/react-query";
import { ScoreRing, RiskBadge, brand } from "@astraguard/ui";
import { apiClient } from "../../../lib/api";
import { ReportButton } from "./ReportButton";

interface ProjectPageProps {
  params: { id: string };
}

/**
 * Dashboard — project page (ARCHITECTURE.md §4.2):
 * live score, verification breakdown, coverage status, report button.
 */
export default function ProjectPage({ params }: ProjectPageProps) {
  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["project", params.id],
    queryFn: () => apiClient.getProject(params.id)
  });

  if (isLoading) return <main style={{ padding: 64 }}>Loading…</main>;
  if (isError || !project) return <main style={{ padding: 64 }}>Project not found.</main>;

  const { score, verification, coverage } = project;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ScoreRing score={score.score} />
        <div>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <RiskBadge verdict={score.verdict} score={score.score} />
        </div>
      </header>

      <section style={{ marginTop: 32 }}>
        <h2>Verification breakdown</h2>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 16px" }}>
          <dt>Contract audit</dt>
          <dd>{verification.contractAudit}</dd>
          <dt>Reserve ratio</dt>
          <dd>{verification.reserveRatio ?? "—"}</dd>
          <dt>Team KYC</dt>
          <dd>{verification.teamKyc}</dd>
          <dt>Behavioral flags</dt>
          <dd>
            {verification.behavioralFlags.length > 0
              ? verification.behavioralFlags.join(", ")
              : "None"}
          </dd>
        </dl>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Coverage</h2>
        <p style={{ color: coverage.eligible ? brand.teal : brand.slate }}>
          {coverage.eligible
            ? "Transactions with this project are insurance-eligible ✓"
            : (coverage.reason ?? "Not currently insurance-eligible.")}
        </p>
      </section>

      <ReportButton contractId={project.contractId} />
    </main>
  );
}
