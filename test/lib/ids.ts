import type { TestInfo } from "@playwright/test";

/**
 * Build a unique Medicaid SPA ID in the form SS-YY-NNNN-XXXX.
 * Uses worker/parallel/retry indices so IDs stay unique across shards and retries.
 */
export function uniqueSpaId(testInfo: TestInfo, state = "MD"): string {
  const yy = String(new Date().getFullYear()).slice(-2);
  const nnnn = String(
    (testInfo.workerIndex * 100 + testInfo.parallelIndex + testInfo.retry * 17) % 10_000,
  ).padStart(4, "0");
  const stamp = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-4);
  const repeat = ((testInfo.repeatEachIndex ?? 0) % 36).toString(36).toUpperCase();
  const xxxx = `${stamp.slice(0, 3)}${repeat}`.slice(0, 4).padEnd(4, "0");
  return `${state}-${yy}-${nnnn}-${xxxx}`;
}
