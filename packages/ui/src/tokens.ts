/**
 * Shared brand tokens. Single source of truth for colors used across
 * website, dashboard, extension, and badge — keeps the verdict semantics
 * (safe / caution / danger) consistent everywhere a score is rendered.
 */

export const brand = {
  teal: "#0F6E56",
  tealDark: "#0B5642",
  tealLight: "#E6F3EF",
  ink: "#0B1F1A",
  slate: "#5B6B67"
} as const;

export type Verdict = "safe" | "caution" | "danger";

export const verdictColors: Record<Verdict, { fg: string; bg: string; border: string }> = {
  safe: { fg: "#0F6E56", bg: "#E6F3EF", border: "#0F6E56" },
  caution: { fg: "#8A6100", bg: "#FFF6E0", border: "#D69B00" },
  danger: { fg: "#8A1B1B", bg: "#FDE9E9", border: "#C22C2C" }
};

export const verdictLabels: Record<Verdict, string> = {
  safe: "Verified & covered",
  caution: "Unverified — proceed carefully",
  danger: "Flagged"
};
