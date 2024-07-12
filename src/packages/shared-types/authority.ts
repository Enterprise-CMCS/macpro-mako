// TODO: Refactor out
export enum Authority {
  MED_SPA = "medicaid spa",
  CHIP_SPA = "chip spa",
  "1915b" = "1915(b)",
  "1915c" = "1915(c)",
}

export type AuthorityUnion =
  | "Medicaid SPA"
  | "CHIP SPA"
  | "1915(b)"
  | "1915(c)";

export type AuthorityAPI = "medicaid spa" | "chip spa" | "1915(b)" | "1915(c)";

export const AUTHORITY_FE_TO_API: Record<AuthorityUnion, AuthorityAPI> = {
  "CHIP SPA": "chip spa",
  "Medicaid SPA": "medicaid spa",
  "1915(b)": "1915(b)",
  "1915(c)": "1915(c)",
};

export const AUTHORITY_API_TO_FE: Record<AuthorityAPI, AuthorityUnion> = {
  "1915(b)": "1915(b)",
  "1915(c)": "1915(c)",
  "chip spa": "CHIP SPA",
  "medicaid spa": "Medicaid SPA",
};
