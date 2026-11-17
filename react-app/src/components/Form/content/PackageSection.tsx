import { useParams } from "react-router";
import { AuthorityUnion, CE_HARDSHIP_EXCEPTION_LABEL } from "shared-types";

import { useGetItem } from "@/api";
import { BLANK_VALUE } from "@/consts";
import {
  formatCentraSubmissionDate,
  formatHardshipKindLabel,
  isCeHardshipException,
  readCentraHardshipKind,
  readCentraSubmissionDate,
} from "@/utils/centra";

export const getIdLabel = (authority: AuthorityUnion) => {
  const idLabels = new Map<AuthorityUnion, string>([
    ["CHIP SPA", "Package ID"],
    ["Medicaid SPA", "Package ID"],
    ["1915(b)", "Waiver Number"],
    ["1915(c)", "Waiver Number"],
    ["CE_HARDSHIP_EXCEPTION", "Submission ID"],
  ]);

  return idLabels.get(authority) ?? BLANK_VALUE;
};

export const getAuthorityLabel = (authority: AuthorityUnion) => {
  const authorityLabels = new Map<AuthorityUnion, string>([
    ["CHIP SPA", "CHIP SPA"],
    ["Medicaid SPA", "Medicaid SPA"],
    ["1915(b)", "1915(b) Waiver"],
    ["1915(c)", "1915(c) Waiver"],
    ["CE_HARDSHIP_EXCEPTION", CE_HARDSHIP_EXCEPTION_LABEL],
  ]);

  return authorityLabels.get(authority) ?? BLANK_VALUE;
};

export const PackageSection = () => {
  const { id, authority } = useParams<{
    id: string;
    authority: AuthorityUnion;
  }>();
  const isCentra = isCeHardshipException(authority);
  const { data: record } = useGetItem(
    id ?? "",
    { enabled: Boolean(id) && isCentra },
    {
      includeDraft: true,
    },
  );
  const submission = record?._source;

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
      {isCentra && (
        <>
          <div>
            <p className="font-bold">Request Type</p>
            <p className="text-xl">
              {formatHardshipKindLabel(submission ? readCentraHardshipKind(submission) : undefined)}
            </p>
          </div>
          <div>
            <p className="font-bold">Submission Date</p>
            <p className="text-xl">
              {formatCentraSubmissionDate(
                submission ? readCentraSubmissionDate(submission) : undefined,
              )}
            </p>
          </div>
        </>
      )}
    </section>
  );
};
