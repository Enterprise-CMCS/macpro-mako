import { useEffect, useMemo, useRef } from "react";
import { Authority, opensearch } from "shared-types";

import { useGetUser } from "@/api/useGetUser";
import { DetailsSection, LoadingSpinner } from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
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
        <dl key={label}>
          <dt className="font-bold">{label}</dt>
          <dd className="py-2">{value}</dd>
        </dl>
      ) : null;
    })}
  </div>
);

type PackageDetailsProps = {
  submission: opensearch.main.Document;
};

export const PackageDetails = ({ submission }: PackageDetailsProps) => {
  const { data: user, isLoading: isUserLoading } = useGetUser();
  const didSetGATag = useRef<boolean>(false);
  const isCHIPDetailsEnabled = useFeatureFlag("CHIP_SPA_DETAILS");
  const title = useMemo(() => {
    const hasChipSubmissionType =
      Array.isArray(submission.chipSubmissionType) && submission.chipSubmissionType.length > 0;

    const hasChipEligibilityAttachment =
      Array.isArray(submission.attachments?.chipEligibility?.files) &&
      submission.attachments.chipEligibility.files.length > 0;

    if (isCHIPDetailsEnabled && (hasChipSubmissionType || hasChipEligibilityAttachment)) {
      return "CHIP Eligibility SPA Package Details";
    }

    switch (submission.authority) {
      //possibly add option for chip eligibility here
      case Authority["1915b"]:
      case Authority["1915c"]:
      case undefined:
        if (submission.actionType === "Amend" && submission.authority === Authority["1915c"])
          return "1915(c) Appendix K Amendment Package Details";
        if (submission.actionType === "Extend") return "Temporary Extension Request Details";
    }

    return `${submission.authority} Package Details`;
  }, [submission, isCHIPDetailsEnabled]);

  useEffect(() => {
    if (!isUserLoading && typeof window.gtag == "function" && !didSetGATag.current) {
      sendGAEvent("package_details_view", {
        package_id: submission.id,
        package_type: submission.authority,
        state: submission.state,
        ...(user?.user?.role && { user_role: user?.user?.role }),
      });
      didSetGATag.current = true;
    }
  }, [isUserLoading]); // eslint-disable-line react-hooks/exhaustive-deps
  // we only want this to run when the user finishes loading

  if (isUserLoading) return <LoadingSpinner />;

  return (
    <DetailsSection id="package_details" title={title} childrenClassName="grid gap-y-8">
      <div>
        <PackageDetailsGrid
          details={[
            ...getSubmissionDetails(submission, user, isCHIPDetailsEnabled),
            ...getApprovedAndEffectiveDetails(submission, user, isCHIPDetailsEnabled),
            ...getDescriptionDetails(submission, user, isCHIPDetailsEnabled),
          ]}
        />
        <hr className="my-4" />
        <PackageDetailsGrid
          details={getSubmittedByDetails(submission, user, isCHIPDetailsEnabled)}
        />
      </div>
    </DetailsSection>
  );
};
