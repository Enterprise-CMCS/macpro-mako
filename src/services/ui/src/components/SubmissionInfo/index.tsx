import { BLANK_VALUE } from "@/consts";
import { OsMainSourceItem } from "shared-types";
import { useMemo, useState } from "react";

export const ReviewTeamList = ({ team }: { team: string[] | undefined }) => {
  const [expanded, setExpanded] = useState(false);
  const displayTeam = useMemo(
    () => (expanded ? team : team?.slice(0, 3)),
    [expanded, team]
  );

  return !displayTeam || !displayTeam.length ? (
    BLANK_VALUE
  ) : (
    <ul>
      {displayTeam.map((reviewer, idx) => (
        <li key={`reviewteam-ul-${reviewer}-${idx}`}>{reviewer}</li>
      ))}
      {team && team?.length > 3 && (
        <li className={"text-xs text-sky-600 hover:cursor-pointer"}>
          <button onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "Show less" : "Show more"}
          </button>
        </li>
      )}
    </ul>
  );
};
export const SubmissionInfo = (data: OsMainSourceItem) => {
  const submissionSource = () => {
    if (data?.origin?.toLowerCase() === "onemac") {
      return "OneMAC";
    } else {
      return BLANK_VALUE;
    }
  };
  const submissionDetails = [
    {
      label: "Submitted By",
      value: <p className="text-lg">{data?.submitterName || BLANK_VALUE}</p>,
    },
    {
      label: "CPOC Name",
      value: <p className="text-lg">{data?.leadAnalystName || BLANK_VALUE}</p>,
    },
    {
      label: "Submission Source",
      value: <p className="text-lg">{submissionSource()}</p>,
    },
    {
      label: "Review Team (SRT)",
      value: <ReviewTeamList team={data.reviewTeam} />,
    },
    {
      label: "Subject",
      value: <p>{data?.subject || BLANK_VALUE}</p>,
    },
    {
      label: "Description",
      value: <p>{data?.description || BLANK_VALUE}</p>,
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
