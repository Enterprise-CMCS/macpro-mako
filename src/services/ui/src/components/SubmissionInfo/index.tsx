import { Link } from "react-router-dom";

const submissionDetails = [
  {
    label: "Submitter",
    value: (
      <Link to="#" className="text-lg text-blue-500">
        Lisa Quinones
      </Link>
    ),
  },
  {
    label: "CPOC Name",
    value: (
      <Link to="#" className="text-lg text-blue-500">
        Kyle Roseborrough
      </Link>
    ),
  },
  {
    label: "Submission Source",
    value: <p className="text-lg">OneMAC</p>,
  },
];

const reviewerDetails = [
  { label: "Reviewing Division", value: "Lorem Ipsum" },
  { label: "Additional Reviewing Division", value: "Lorem Ipsum" },
];

export const SubmissionInfo = () => {
  return (
    <>
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
