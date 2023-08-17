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
      // value: data.subType,
      value: "Define Me!",
    },
    {
      label: "Initial Submission Date",
      value: data.submissionDate
        ? format(data.submissionDate, "MM/dd/yyyy")
        : "None",
    },
    {
      label: "Recent Submission Date",
      // value: data.recentSubmissionDate,
      value: "Define Me!",
    },
    {
      label: "Proposed Effective Date",
      value: data.proposedDate
        ? format(data.proposedDate, "MM/dd/yyyy")
        : "None",
    },
    {
      label: "Approved Effective Date",
      value: data.approvedEffectiveDate
        ? format(data.approvedEffectiveDate, "MM/dd/yyyy")
        : "None",
    },
    {
      label: "Change Date",
      value: data.changedDate ? format(data.changedDate, "MM/dd/yyyy") : "None",
    },
    {
      label: "Final Disposition Date",
      value: "Define Me!",
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
