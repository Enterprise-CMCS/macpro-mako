import { format } from "date-fns";
import { OsMainSourceItem } from "shared-types";
import { removeUnderscoresAndCapitalize } from "@/utils";

export const ChipSpaPackageDetails = (data: OsMainSourceItem) => {
  if (!data) return null;
  const detailFields = [
    {
      label: "Submission ID",
      value: data.id,
    },
    {
      label: "State",
      value: data.state,
    },
    {
      label: "Type",
      value: removeUnderscoresAndCapitalize(data.planType),
    },
    {
      label: "Sub-Type",
      value: data.actionType || "N/A",
    },
    {
      label: "Initial Submission Date",
      value: data.submissionDate
        ? format(data.submissionDate, "MM/dd/yyyy")
        : "N/A",
    },
    {
      label: "Proposed Effective Date",
      value: data.proposedDate
        ? format(data.proposedDate, "MM/dd/yyyy")
        : "N/A",
    },
    {
      label: "Approved Effective Date",
      value: data.approvedEffectiveDate
        ? format(data.approvedEffectiveDate, "MM/dd/yyyy")
        : "N/A",
    },
    {
      label: "Change Date",
      value: data.changedDate ? format(data.changedDate, "MM/dd/yyyy") : "N/A",
    },
  ];
  return (
    <div className="tw-grid tw-grid-cols-2 tw-gap-4">
      {detailFields.map(({ label, value }) => {
        return (
          <div key={label}>
            <h3 className="tw-text-sm">{label}</h3>
            <p className="tw-text-lg">{value}</p>
          </div>
        );
      })}
    </div>
  );
};
