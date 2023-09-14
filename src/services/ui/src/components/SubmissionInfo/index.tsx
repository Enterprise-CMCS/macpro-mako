import { OsMainSourceItem } from "shared-types";

export const SubmissionInfo = (data: OsMainSourceItem) => {
  let cpocName = "";
  if (data.leadAnalystName) {
    cpocName = data.leadAnalystName;
  }
  const submissionDetails = [
    {
      label: "Submitted By",
      value: <p className="text-lg">{data.submitterName || "-- --"}</p>,
    },
    {
      label: "CPOC Name",
      value: <p className="text-lg">{cpocName || "-- --"}</p>,
    },
    {
      label: "Origin",
      value: <p className="text-lg">{data.origin || "-- --"}</p>,
    },
  ];
  return (
    <>
      <hr className="my-4" />
      <div className="grid grid-cols-2 gap-4">
        {submissionDetails.map(({ label, value }) => {
          return (
            <div key={label}>
              <h3 className="text-sm">{label}</h3>
              {value}
            </div>
          );
        })}
      </div>
    </>
  );
};
