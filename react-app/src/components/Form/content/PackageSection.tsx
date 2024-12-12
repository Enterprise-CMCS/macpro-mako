import { BLANK_VALUE } from "@/consts";
import { useParams } from "react-router";
import { AuthorityUnion } from "shared-types";

export const getIdLabel = (authority: AuthorityUnion | null | undefined) => {
  if (authority === undefined || authority === null) {
    return BLANK_VALUE;
  }

  const idLabels = new Map<AuthorityUnion, string>([
    ["CHIP SPA", "Package ID"],
    ["Medicaid SPA", "Package ID"],
    ["1915(b)", "Waiver Number"],
    ["1915(c)", "Waiver Number"],
  ]);

  return idLabels.get(authority) ?? BLANK_VALUE;
};

export const getAuthorityLabel = (authority: AuthorityUnion | null | undefined) => {
  if (authority === undefined || authority === null) {
    return BLANK_VALUE;
  }

  const authorityLabels = new Map<AuthorityUnion, string>([
    ["CHIP SPA", "CHIP SPA"],
    ["Medicaid SPA", "Medicaid SPA"],
    ["1915(b)", "1915(b) Waiver"],
    ["1915(c)", "1915(c) Waiver"],
  ]);

  return authorityLabels.get(authority) ?? BLANK_VALUE;
};

export const PackageSection = () => {
  const { id, authority } = useParams<{
    id: string;
    authority: AuthorityUnion;
  }>();

  return (
    <section className="flex flex-col mb-8 space-y-8">
      <div>
        <p className="font-bold">{getIdLabel(authority)}</p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p className="font-bold">Authority</p>
        <p className="text-xl">{getAuthorityLabel(authority)}</p>
      </div>
    </section>
  );
};
