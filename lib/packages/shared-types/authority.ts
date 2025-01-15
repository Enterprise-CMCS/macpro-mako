// TODO: Refactor out
export enum Authority {
  MED_SPA = "medicaid spa",
  CHIP_SPA = "chip spa",
  "1915b" = "1915(b)",
  "1915c" = "1915(c)",
}

export type AuthorityUnion = "Medicaid SPA" | "CHIP SPA" | "1915(b)" | "1915(c)";
