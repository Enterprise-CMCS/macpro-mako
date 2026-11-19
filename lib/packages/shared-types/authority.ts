// TODO: Refactor out
export enum Authority {
  MED_SPA = "medicaid spa",
  CHIP_SPA = "chip spa",
  "1915b" = "1915(b)",
  "1915c" = "1915(c)",
  /**
   * Lowercase so PackageCheck matches `authority.toLowerCase()`.
   * Kafka and OpenSearch store `CE_HARDSHIP_EXCEPTION`.
   * The missing-record query excludes that keyword, and parseAuthority drops both
   * stored forms, so the escalation job does not email CEntra.
   */
  CE_HARDSHIP_EXCEPTION = "ce_hardship_exception",
}

export type AuthorityUnion =
  | "Medicaid SPA"
  | "CHIP SPA"
  | "1915(b)"
  | "1915(c)"
  | "CE_HARDSHIP_EXCEPTION";
