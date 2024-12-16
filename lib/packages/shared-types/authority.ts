// TODO: Refactor out
export enum Authority {
  MED_SPA = "Medicaid SPA",
  CHIP_SPA = "CHIP SPA",
  "1915b" = "1915(b)",
  "1915c" = "1915(c)",
}

export type AuthorityUnion = "Medicaid SPA" | "CHIP SPA" | "1915(b)" | "1915(c)";
