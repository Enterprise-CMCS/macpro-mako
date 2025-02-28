import { useMemo } from "react";
import { DetailsSection } from "@/components";
import {
  getApprovedAndEffectiveDetails,
  getDescriptionDetails,
  getSubmissionDetails,
  getSubmittedByDetails,
} from "./hooks";

import { DetailSectionItem } from "./hooks";
import { useGetUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";

type SubmissionDetailsGridProps = {
  displayItems: DetailSectionItem[];
};

const SubmissionDetailsGrid = ({ displayItems }: SubmissionDetailsGridProps) => (
  <div className="grid grid-cols-2 gap-6">
    {displayItems.map(({ label, value, canView = true }) => {
      return canView ? (
        <div key={label}>
          <h3 className="font-bold">{label}</h3>
          <div className="py-2">{value}</div>
        </div>
      ) : null;
    })}
  </div>
);

type SubmissionDetailsProps = {
  itemResult: ItemResult;
};

export const SubmissionDetails = ({ itemResult }: SubmissionDetailsProps) => {
  const { data: user } = useGetUser();
  const { _source: submission } = itemResult;

  const title = useMemo(() => {
    switch (submission.authority) {
      case Authority["1915b"]:
      case Authority["1915c"]:
      case undefined: // Some TEs have no authority
        if (submission.actionType == "Amend" && submission.authority === Authority["1915c"])
          return "1915(c) Appendix K Amendment Package Details";
        if (submission.actionType == "Extend") return "Temporary Extension Request Details";
    }

    return `${submission.authority} Package Details`;
  }, [submission]);

  return (
    <DetailsSection id="package_details" title={title}>
      <div className="flex-col gap-4 max-w-2xl">
        <SubmissionDetailsGrid
          displayItems={[
            ...getSubmissionDetails(submission, user),
            ...getApprovedAndEffectiveDetails(submission, user),
            ...getDescriptionDetails(submission, user),
          ]}
        />
        <hr className="my-4" />
        <SubmissionDetailsGrid displayItems={getSubmittedByDetails(submission, user)} />
      </div>
    </DetailsSection>
  );
};
