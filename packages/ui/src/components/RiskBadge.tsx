import { forwardRef } from "react";
import { verdictColors, type Verdict } from "../tokens";

export interface RiskBadgeProps {
  verdict: Verdict;
  score?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Compact inline pill — used in dashboard lists and the merchant badge widget. */
export const RiskBadge = forwardRef<HTMLSpanElement, RiskBadgeProps>(function RiskBadge(
  { verdict, score, className, style },
  ref
) {
  const colors = verdictColors[verdict];

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 10px",
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.fg,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "system-ui, sans-serif",
        ...style
      }}
    >
      {verdict.toUpperCase()}
      {typeof score === "number" && <span aria-hidden>· {score}</span>}
    </span>
  );
});
