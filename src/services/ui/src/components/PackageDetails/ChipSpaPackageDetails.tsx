import { format } from "date-fns";

export const ChipSpaPackageDetails = (data:any) => {
  const detailFields = [
    {
      label: "SPA ID",
      value: data["SPA ID"],
    },
    {
      label: "State",
      value: data["State"],
    },
    {
      label: "Type",
      value: data["Type"],
    },
    {
      label: "Sub-Type",
      value: data["Sub-Type"],
    },
    {
      label: "Initial Submission Date",
      value: data["Initial Submission Date"] ? format(data["Initial Submission Date"], "MM/dd/yyyy") : "None",
    },
    {
      label: "Recent Submission Date",
      value: data["Recent Submission Date"] ? format(data["Recent Submission Date"], "MM/dd/yyyy") : "None",
    },
    {
      label: "Proposed Effective Date",
      value: data["Proposed Submission Date"] ? format(data["Proposed Effective Date"], "MM/dd/yyyy") : "None",
    },
    {
      label: "Approved Effective Date",
      value: data["Approved Submission Date"] ? format(data["Approved Effective Date"], "MM/dd/yyyy") : "None",
    },
    {
      label: "Change Date",
      value: data["Change Date"] ? format(data["Change Date"], "MM/dd/yyyy") : "None",
    },
    {
      label: "Final Disposition Date",
      value: "N/A",
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
