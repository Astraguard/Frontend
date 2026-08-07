import type { Meta, StoryObj } from "@storybook/react";
import { VerdictBanner } from "../components/VerdictBanner";

const meta: Meta<typeof VerdictBanner> = {
  title: "UI / VerdictBanner",
  component: VerdictBanner,
  tags: ["autodocs"],
  argTypes: {
    verdict: {
      control: "select",
      options: ["safe", "caution", "danger"],
      description: "Risk verdict returned by the backend scan endpoint"
    },
    reasons: {
      control: "object",
      description: "Short human-readable reasons from the /v1/scan response"
    },
    onOverride: {
      description:
        "Called when the user explicitly accepts the risk on a danger verdict. Required to show the override button."
    }
  }
};

export default meta;
type Story = StoryObj<typeof VerdictBanner>;

// ─── Verdict-state stories ────────────────────────────────────────────────────

/**
 * Green banner — no action required. Shown by the extension before a wallet
 * signature when the project scores above the safe threshold.
 */
export const Safe: Story = {
  args: {
    verdict: "safe",
    reasons: ["Escrow active", "Identity verified", "No flagged transactions"]
  }
};

/**
 * Amber banner — user can proceed but should read the reasons.
 * Extension shows this inline; dashboard shows it in the project header.
 */
export const Caution: Story = {
  args: {
    verdict: "caution",
    reasons: ["Identity unverified", "Escrow not active"]
  }
};

/**
 * Red banner — signature is blocked by default. `onOverride` must be wired
 * for the "proceed anyway" button to appear. Requires an explicit click —
 * never a default/auto-dismiss action.
 */
export const Danger: Story = {
  args: {
    verdict: "danger",
    reasons: ["Flagged for rug pull pattern", "Wallet linked to known scam", "Smart contract exploited"],
    onOverride: () => console.log("override clicked")
  }
};

/**
 * Danger without an onOverride handler — the override button is hidden.
 * Relevant in read-only contexts (dashboard) where the extension override
 * flow is not available.
 */
export const DangerNoOverride: Story = {
  name: "Danger — no override (read-only context)",
  args: {
    verdict: "danger",
    reasons: ["Flagged for rug pull pattern"]
  }
};

// ─── No-reasons variants ──────────────────────────────────────────────────────

/** Banner rendered when the scan returns no structured reason strings. */
export const SafeNoReasons: Story = {
  name: "Safe — no reasons",
  args: { verdict: "safe" }
};

export const CautionNoReasons: Story = {
  name: "Caution — no reasons",
  args: { verdict: "caution" }
};

export const DangerNoReasons: Story = {
  name: "Danger — no reasons, with override",
  args: { verdict: "danger", onOverride: () => console.log("override clicked") }
};

// ─── Width-constraint simulations ────────────────────────────────────────────

/**
 * 320 px constraint mirrors the extension popup width.
 * Verify text wraps correctly and the override button remains reachable.
 */
export const NarrowPopup: Story = {
  name: "Narrow — extension popup (320 px)",
  render: () => (
    <div style={{ width: 320 }}>
      <VerdictBanner
        verdict="danger"
        reasons={["Flagged for rug pull pattern", "Wallet linked to known scam"]}
        onOverride={action("override-clicked")}
      />
    </div>
  )
};

/**
 * Full-width (100 %) mirrors dashboard project-page usage.
 */
export const FullWidth: Story = {
  name: "Full-width — dashboard project page",
  render: () => (
    <VerdictBanner
      verdict="caution"
      reasons={["Identity unverified", "Escrow not active"]}
      style={{ width: "100%" }}
    />
  )
};

// ─── All three verdicts side by side ─────────────────────────────────────────

/** All three banners stacked for rapid visual comparison. */
export const AllVerdicts: Story = {
  name: "All verdict states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <VerdictBanner verdict="safe" reasons={["Escrow active", "Identity verified"]} />
      <VerdictBanner verdict="caution" reasons={["Identity unverified"]} />
      <VerdictBanner
        verdict="danger"
        reasons={["Flagged for rug pull pattern"]}
        onOverride={action("override-clicked")}
      />
    </div>
  )
};
