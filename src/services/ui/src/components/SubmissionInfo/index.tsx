import { Link } from "react-router-dom";

export const SubmissionInfo = (data: any) => {
  const submissionDetails = [
    {
      label: "Submitter",
      value: <p className="text-lg">{data.submitterName || "None"}</p>,
    },
    {
      label: "CPOC Name",
      value: <p className="text-lg">{data.leadAnalyst || "None"}</p>,
    },
    {
      label: "Submission Source",
      value: <p className="text-lg">{data.submissionOrigin || "Unknown"}</p>,
    },
  ];
  const reviewerDetails = [
    { label: "Reviewing Division", value: "Lorem Ipsum" },
    { label: "Additional Reviewing Division", value: "Lorem Ipsum" },
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
      <div className="grid grid-cols-2 gap-4 my-4">
        {reviewerDetails.map(({ label, value }) => {
          return (
            <div key={label}>
              <h3 className="text-sm">{label}</h3>
              <p className="text-lg">{value}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};
