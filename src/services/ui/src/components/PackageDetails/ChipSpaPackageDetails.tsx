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
    value: "Wed, Sep 9 2022, 3:13:07 PM",
  },
  {
    label: "Recent Submission Date",
    value: "Wed, Nov 16 2022, 9:12:44 PM",
  },
  {
    label: "Proposed Effective Date",
    value: "Oct 1, 2022",
  },
  {
    label: "Approved Effective Date",
    value: "– –",
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

export const ChipSpaPackageDetails = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map(({ label, value }) => {
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
