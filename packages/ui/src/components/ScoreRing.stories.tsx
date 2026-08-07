import type { Meta, StoryObj } from "@storybook/react";
import { ScoreRing } from "../components/ScoreRing";

const meta: Meta<typeof ScoreRing> = {
  title: "UI / ScoreRing",
  component: ScoreRing,
  tags: ["autodocs"],
  argTypes: {
    score: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Trust score 0–100 as returned by GET /v1/scores/:assetOrContract"
    },
    size: {
      control: { type: "range", min: 48, max: 200, step: 8 },
      description: "Diameter of the ring in pixels"
    },
    strokeWidth: {
      control: { type: "range", min: 2, max: 20, step: 1 },
      description: "Thickness of the arc stroke"
    }
  }
};

export default meta;
type Story = StoryObj<typeof ScoreRing>;

// ─── Verdict-state stories (canonical safe / caution / danger thresholds) ────

/** Score ≥ 75 — rendered green, used on dashboard project pages and merchant badge. */
export const Safe: Story = {
  args: { score: 82 }
};

/** Score 40–74 — rendered amber. The extension shows this before a wallet signature. */
export const Caution: Story = {
  args: { score: 55 }
};

/** Score < 40 — rendered red. Extension blocks the signature flow by default. */
export const Danger: Story = {
  args: { score: 18 }
};

// ─── Edge cases ───────────────────────────────────────────────────────────────

/** Perfect score — ring is fully filled. */
export const Perfect: Story = {
  args: { score: 100 }
};

/** Zero score — ring track is empty, only the background arc shows. */
export const Zero: Story = {
  args: { score: 0 }
};

/** Values outside [0, 100] are clamped before rendering. */
export const Clamped: Story = {
  name: "Out-of-range (clamped to 100)",
  args: { score: 150 }
};

// ─── Size variants ────────────────────────────────────────────────────────────

/** Default 96 px used on the dashboard project page. */
export const SizeMd: Story = {
  name: "Size — dashboard (96 px)",
  args: { score: 72, size: 96 }
};

/** Compact 48 px for use inside list rows or the extension popup sidebar. */
export const SizeSm: Story = {
  name: "Size — compact (48 px)",
  args: { score: 72, size: 48, strokeWidth: 5 }
};

/** Large 160 px for hero / spotlight placement on a project page. */
export const SizeLg: Story = {
  name: "Size — hero (160 px)",
  args: { score: 72, size: 160, strokeWidth: 12 }
};

// ─── All three verdicts side by side ─────────────────────────────────────────

/** Renders all three verdict-range scores next to each other for quick comparison. */
export const AllVerdicts: Story = {
  name: "All verdict states",
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <ScoreRing score={82} />
        <span style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600 }}>SAFE (82)</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <ScoreRing score={55} />
        <span style={{ fontSize: 12, color: "#8A6100", fontWeight: 600 }}>CAUTION (55)</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <ScoreRing score={18} />
        <span style={{ fontSize: 12, color: "#8A1B1B", fontWeight: 600 }}>DANGER (18)</span>
      </div>
    </div>
  )
};
