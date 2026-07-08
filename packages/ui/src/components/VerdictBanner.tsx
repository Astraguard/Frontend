import { forwardRef } from "react";
import { verdictColors, verdictLabels, type Verdict } from "../tokens";

export interface VerdictBannerProps {
  verdict: Verdict;
  /** Short human-readable reasons from the /v1/scan response. */
  reasons?: string[];
  onOverride?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Injected by the extension's content script before a wallet signature is
 * confirmed. `danger` verdicts are blocked by default — overriding requires
 * an explicit click, never a default/auto-dismiss action.
 */
export const VerdictBanner = forwardRef<HTMLDivElement, VerdictBannerProps>(function VerdictBanner(
  { verdict, reasons = [], onOverride, className, style },
  ref
) {
  const colors = verdictColors[verdict];

  return (
    <div
      ref={ref}
      role="alert"
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.fg,
        fontFamily: "system-ui, sans-serif",
        ...style
      }}
    >
      <strong>{verdictLabels[verdict]}</strong>
      {reasons.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      {verdict === "danger" && onOverride && (
        <button type="button" onClick={onOverride} style={{ alignSelf: "flex-start" }}>
          I understand the risk — proceed anyway
        </button>
      )}
    </div>
  );
});
