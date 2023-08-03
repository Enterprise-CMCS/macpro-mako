const data = [
  {
    label: "SPA ID",
    value: "VA-43-7700-CHIP",
  },
  {
    label: "State",
    value: "Virginia",
  },
  {
    label: "Type",
    value: "Medicaid SPA",
  },
  {
    label: "Sub-Type",
    value: "Lorem Ipsum",
  },
  {
    label: "Initial Submission Date",
    value: "None",
  },
  {
    label: "Recent Submission Date",
    value: "None",
  },
  {
    label: "Proposed Effective Date",
    value: "None",
  },
  {
    label: "Approved Effective Date",
    value: "None",
  },
  {
    label: "Change Date",
    value: "N/A",
  },
  {
    label: "Final Disposition Date",
    value: "N/A",
  },
];

export const ChipSpaPackageDetails = (recordData:any) => {
  console.log("MIKE");
  console.log(recordData);
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map(({ label, value }) => {
        return (
          <div key={label}>
            <h3 className="text-sm">{label}</h3>
            <p className="text-lg">{recordData.data[label] || value}</p>
          </div>
        );
      })}
    </div>
  );
};
