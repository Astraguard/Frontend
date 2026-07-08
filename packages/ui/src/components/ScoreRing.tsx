import { forwardRef } from "react";
import { brand } from "../tokens";

export interface ScoreRingProps {
  /** Trust score 0–100, as returned by GET /v1/scores/:assetOrContract */
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Circular trust-score gauge used on dashboard project pages. */
export const ScoreRing = forwardRef<SVGSVGElement, ScoreRingProps>(function ScoreRing(
  { score, size = 96, strokeWidth = 8, className, style },
  ref
) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg
      ref={ref}
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Trust score ${clamped} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={brand.tealLight}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={brand.teal}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.28}
        fontWeight={600}
        fill={brand.ink}
      >
        {clamped}
      </text>
    </svg>
  );
});
