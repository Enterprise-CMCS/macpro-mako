import { useMemo } from "react";
import { Authority, opensearch } from "shared-types";

import { useGetUser } from "@/api/useGetUser";
import { DetailsSection, LoadingSpinner } from "@/components";

import {
  getApprovedAndEffectiveDetails,
  getDescriptionDetails,
  getSubmissionDetails,
  getSubmittedByDetails,
} from "./details";
import { LabelAndValue } from "./details";

type PackageDetailsGridProps = {
  details: LabelAndValue[];
};

const PackageDetailsGrid = ({ details }: PackageDetailsGridProps) => (
  <div className="grid grid-cols-2 gap-6">
    {details.map(({ label, value, canView = true }) => {
      return canView ? (
        <div key={label}>
          <h3 className="font-bold">{label}</h3>
          <div className="py-2">{value}</div>
        </div>
      ) : null;
    })}
  </div>
);

type PackageDetailsProps = {
  submission: opensearch.main.Document;
};

export const PackageDetails = ({ submission }: PackageDetailsProps) => {
  const { data: user, isLoading: isUserLoading } = useGetUser();
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

  if (isUserLoading) return <LoadingSpinner />;

  return (
    <DetailsSection id="package_details" title={title}>
      <div className="flex-col gap-4 max-w-2xl">
        <PackageDetailsGrid
          details={[
            ...getSubmissionDetails(submission, user),
            ...getApprovedAndEffectiveDetails(submission, user),
            ...getDescriptionDetails(submission, user),
          ]}
        />
        <hr className="my-4" />
        <PackageDetailsGrid details={getSubmittedByDetails(submission, user)} />
      </div>
    </DetailsSection>
  );
};
