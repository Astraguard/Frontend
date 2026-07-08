/**
 * Hand-written shapes mirroring astraguard-backend's openapi.yaml
 * (ARCHITECTURE.md §2.1, §4.3). Replace this file with generated types
 * once that spec is published — see openapi-codegen note in README.
 */

export type Verdict = "safe" | "caution" | "danger";

export interface TrustScore {
  assetOrContract: string;
  score: number;
  verdict: Verdict;
  updatedAt: string;
}

export interface ScoreHistoryPoint {
  timestamp: string;
  score: number;
}

export interface VerificationBreakdown {
  contractAudit: "passed" | "failed" | "pending" | "not_submitted";
  reserveRatio: number | null;
  teamKyc: "verified" | "pending" | "not_submitted";
  behavioralFlags: string[];
}

export interface CoverageStatus {
  eligible: boolean;
  reason?: string;
}

export interface Project {
  id: string;
  name: string;
  contractId: string;
  score: TrustScore;
  verification: VerificationBreakdown;
  coverage: CoverageStatus;
}

export interface ScanRequest {
  /**
   * Raw transaction envelope XDR the wallet is about to sign. The backend
   * parses operations, destinations, and Soroban contract invocations from
   * this — the frontend never duplicates XDR-parsing logic (ARCHITECTURE.md
   * §1's golden rule: the frontend never computes trust logic).
   */
  xdr: string;
  networkPassphrase?: string;
  /** Stellar address requesting the signature, if the wallet exposed it. */
  signerAddress?: string;
}

export interface ScanResponse {
  verdict: Verdict;
  score: number;
  reasons: string[];
}

export interface RegistryReport {
  id: string;
  address: string;
  category: string;
  status: "pending" | "endorsed" | "confirmed";
  evidenceHash: string;
  createdAt: string;
}

export interface ClaimSubmission {
  projectId: string;
  victim: string;
  amount: string;
  evidenceHash: string;
}

export interface Claim extends ClaimSubmission {
  id: string;
  status: "filed" | "review" | "approved" | "rejected" | "paid";
  createdAt: string;
}
