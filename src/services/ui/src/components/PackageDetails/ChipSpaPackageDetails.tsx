import { format } from "date-fns";
import { OsMainSourceItem } from "shared-types";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { LABELS } from "@/lib";

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
      label: "Sub Type",
      value: data.actionType
        ? LABELS[data.actionType as keyof typeof LABELS] || data.actionType
        : "-- --",
    },
    {
      label: "Initial Submission Date",
      value: data.submissionDate
        ? format(new Date(data.submissionDate), "MM/dd/yyyy")
        : "-- --",
    },
    {
      label: "Proposed Effective Date",
      value: data.proposedDate
        ? format(new Date(data.proposedDate), "MM/dd/yyyy")
        : "-- --",
    },
    {
      label: "Approved Effective Date",
      value: data.approvedEffectiveDate
        ? format(new Date(data.approvedEffectiveDate), "MM/dd/yyyy")
        : "-- --",
    },
    {
      label: "Change Date",
      value: data.changedDate
        ? format(new Date(data.changedDate), "MM/dd/yyyy")
        : "-- --",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {detailFields.map(({ label, value }) => {
        return (
          <div key={label}>
            <h3 className="text-sm">{label}</h3>
            <p className="text-lg">{value}</p>
          </div>
        );
      })}
    </div>
  );
};
