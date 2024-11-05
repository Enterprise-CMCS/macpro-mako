import { BLANK_VALUE } from "@/consts";
import { AuthorityUnion } from "shared-types";

export const LABELS = {
  New: "Initial",
  Amend: "Amendment",
  Renew: "Renewal",
} as const;

export const getIdLabel = (authority: AuthorityUnion) => {
  const idLabels = new Map<AuthorityUnion, string>([
    ["CHIP SPA", "Package ID"],
    ["Medicaid SPA", "Package ID"],
    ["1915(b)", "Waiver Number"],
    ["1915(c)", "Waiver Number"],
  ]);

  return idLabels.get(authority) ?? BLANK_VALUE;
};

export const getAuthorityLabel = (authority: AuthorityUnion) => {
  const authorityLabels = new Map<AuthorityUnion, string>([
    ["CHIP SPA", "CHIP SPA"],
    ["Medicaid SPA", "Medicaid SPA"],
    ["1915(b)", "1915(b) Waiver"],
    ["1915(c)", "1915(c) Waiver"],
  ]);

  return authorityLabels.get(authority) ?? BLANK_VALUE;
};
