import { BLANK_VALUE } from "@/consts";
import { OsMainSourceItem } from "shared-types";
import { isStateUser, isCmsUser } from "shared-utils";
import { ReactElement, ReactNode, useMemo, useState } from "react";
import { OneMacUser, useGetUser } from "@/api/useGetUser";

type DetailSectionItem = {
  label: string;
  value: ReactNode;
  canView: (u: OneMacUser | undefined) => boolean;
};

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
  const { data: user } = useGetUser();
  const submissionSource = () => {
    if (data?.origin?.toLowerCase() === "onemac") {
      return "OneMAC";
    } else {
      return BLANK_VALUE;
    }
  };
  const submissionDetails: DetailSectionItem[] = [
    {
      label: "Submitted By",
      value: <p className="text-lg">{data?.submitterName || BLANK_VALUE}</p>,
      canView: () => true,
    },
    {
      label: "Submission Source",
      value: <p className="text-lg">{submissionSource()}</p>,
      canView: () => true,
    },
    {
      label: "Subject",
      value: <p>{data?.subject || BLANK_VALUE}</p>,
      canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
    },
    {
      label: "Description",
      value: <p>{data?.description || BLANK_VALUE}</p>,
      canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
    },
    {
      label: "CPOC",
      value: <p className="text-lg">{data?.leadAnalystName || BLANK_VALUE}</p>,
      canView: () => true,
    },
    {
      label: "Review Team (SRT)",
      value: <ReviewTeamList team={data.reviewTeam} />,
      canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
    },
  ];
  return (
    <>
      <hr className="my-4" />
      <div className="grid grid-cols-2 gap-4">
        {submissionDetails.map(({ label, value, canView }) => {
          return !canView(user) ? null : (
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
