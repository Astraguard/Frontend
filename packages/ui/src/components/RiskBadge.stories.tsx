import type { Meta, StoryObj } from "@storybook/react";
import { RiskBadge } from "../components/RiskBadge";

const meta: Meta<typeof RiskBadge> = {
  title: "UI / RiskBadge",
  component: RiskBadge,
  tags: ["autodocs"],
  argTypes: {
    verdict: {
      control: "select",
      options: ["safe", "caution", "danger"],
      description: "Risk verdict — drives pill color and label"
    },
    score: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Optional trust score displayed next to the verdict label"
    }
  }
};

export default meta;
type Story = StoryObj<typeof RiskBadge>;

// ─── Verdict-state stories ────────────────────────────────────────────────────

/** Green pill — used in dashboard project lists for verified projects. */
export const Safe: Story = {
  args: { verdict: "safe", score: 82 }
};

/** Amber pill — unverified project; merchant badge widget shows this state. */
export const Caution: Story = {
  args: { verdict: "caution", score: 55 }
};

/** Red pill — flagged project; also appears inline in the extension popup. */
export const Danger: Story = {
  args: { verdict: "danger", score: 18 }
};

// ─── Without score ────────────────────────────────────────────────────────────

/** Badge without a numeric score — label-only pill. */
export const SafeNoScore: Story = {
  name: "Safe — no score",
  args: { verdict: "safe" }
};

export const CautionNoScore: Story = {
  name: "Caution — no score",
  args: { verdict: "caution" }
};

export const DangerNoScore: Story = {
  name: "Danger — no score",
  args: { verdict: "danger" }
};

// ─── Score edge cases ─────────────────────────────────────────────────────────

/** Perfect score of 100. */
export const PerfectScore: Story = {
  name: "Safe — perfect score (100)",
  args: { verdict: "safe", score: 100 }
};

/** Minimum score of 0. */
export const ZeroScore: Story = {
  name: "Danger — zero score (0)",
  args: { verdict: "danger", score: 0 }
};

// ─── Usage contexts ───────────────────────────────────────────────────────────

/**
 * Inline in a list row — typical dashboard usage.
 * Verifies the badge sits correctly within flowing text.
 */
export const InlineInText: Story = {
  name: "Inline — dashboard list row",
  render: () => (
    <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
      <p>
        Project Alpha &nbsp;
        <RiskBadge verdict="safe" score={91} />
      </p>
      <p>
        Project Beta &nbsp;
        <RiskBadge verdict="caution" score={62} />
      </p>
      <p>
        Project Gamma &nbsp;
        <RiskBadge verdict="danger" score={11} />
      </p>
    </div>
  )
};

/**
 * On a dark background — mirrors the ink (#0B1F1A) sidebar of the
 * extension popup where the badge may be placed.
 */
export const OnDarkBackground: Story = {
  name: "On dark background — extension popup",
  render: () => (
    <div
      style={{
        background: "#0B1F1A",
        padding: 16,
        display: "flex",
        gap: 8,
        borderRadius: 8
      }}
    >
      <RiskBadge verdict="safe" score={82} />
      <RiskBadge verdict="caution" score={55} />
      <RiskBadge verdict="danger" score={18} />
    </div>
  ),
  parameters: { backgrounds: { default: "dark" } }
};

// ─── All three verdicts side by side ─────────────────────────────────────────

/** All three verdict badges with scores for quick side-by-side comparison. */
export const AllVerdicts: Story = {
  name: "All verdict states",
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <RiskBadge verdict="safe" score={82} />
      <RiskBadge verdict="caution" score={55} />
      <RiskBadge verdict="danger" score={18} />
    </div>
  )
};
