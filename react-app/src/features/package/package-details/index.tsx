import { useEffect, useMemo, useRef } from "react";
import { Authority, opensearch } from "shared-types";
import { isCmsUser } from "shared-utils";

import { useGetUser } from "@/api/useGetUser";
import { DetailsSection, LoadingSpinner } from "@/components";
import { sendGAEvent } from "@/utils";

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
  <div className="two-cols gap-y-6 sm:gap-y-6">
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
  const didSetGATag = useRef(false);
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

  useEffect(() => {
    if (!isUserLoading && typeof window.gtag == "function" && !didSetGATag.current) {
      const isWaiver = (authority) =>
        authority === Authority["1915c"] || authority === Authority["1915b"];
      sendGAEvent("package_details_view", {
        package_id: submission.id,
        package_type: isWaiver(submission.authority) ? "waiver" : "spa",
        user_role: isCmsUser(user.user) ? "cms" : "state",
      });
      didSetGATag.current = true;
    }
  }, [isUserLoading, user?.user, submission.id, submission.authority, didSetGATag]);

  if (isUserLoading) return <LoadingSpinner />;

  return (
    <DetailsSection id="package_details" title={title} childrenClassName="grid gap-y-8">
      <div>
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
