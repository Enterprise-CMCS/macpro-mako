import { removeUnderscoresAndCapitalize } from "@/utils";
import { isCmsUser } from "shared-utils";

import { BLANK_VALUE } from "@/consts";
import { Authority, opensearch } from "shared-types";
import { FC, ReactNode } from "react";
import { OneMacUser } from "@/api/useGetUser";

import { formatSeatoolDate } from "shared-utils";
import { useMemo, useState } from "react";

export const ReviewTeamList: FC<opensearch.main.Document> = (props) => {
  const [expanded, setExpanded] = useState(false);
  const displayTeam = useMemo(
    () => (expanded ? props.reviewTeam : props.reviewTeam?.slice(0, 3)),
    [expanded, props.reviewTeam]
  );
  return !displayTeam || !displayTeam.length ? (
    BLANK_VALUE
  ) : (
    <ul>
      {displayTeam.map((reviewer, idx) => (
        <li key={`reviewteam-ul-${reviewer}-${idx}`}>{reviewer}</li>
      ))}
      {props.reviewTeam && props.reviewTeam?.length > 3 && (
        <li className={"text-xs text-sky-700 hover:cursor-pointer"}>
          <button onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "Show less" : "Show more"}
          </button>
        </li>
      )}
    </ul>
  );
};

export type DetailSectionItem = {
  label: string;
  value: ReactNode;
  canView: (u: OneMacUser | undefined) => boolean;
};
export const spaDetails = (
  data: opensearch.main.Document
): DetailSectionItem[] => [
  {
    label: "Waiver Authority",
    value: data.authority,
    canView: () => {
      return data.authority?.toLowerCase() == Authority.WAIVER;
    },
  },
  {
    label: "Submission ID",
    value: data.id,
    canView: () => true,
  },
  {
    label: "State",
    value: data.state,
    canView: () => true,
  },
  {
    label: "Type",
    value: data?.authority
      ? removeUnderscoresAndCapitalize(data.authority)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Initial Submission Date",
    value: data.submissionDate
      ? formatSeatoolDate(data.submissionDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Proposed Effective Date",
    value: data.proposedDate
      ? formatSeatoolDate(data.proposedDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Approved Effective Date",
    value: data.approvedEffectiveDate
      ? formatSeatoolDate(data.approvedEffectiveDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Status Date",
    value: data.statusDate ? formatSeatoolDate(data.statusDate) : BLANK_VALUE,
    canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
  },
  {
    label: "Final Disposition Date",
    value: data.finalDispositionDate
      ? formatSeatoolDate(data.finalDispositionDate)
      : BLANK_VALUE,
    canView: () => true,
  },
];

export const submissionDetails = (
  data: opensearch.main.Document
): DetailSectionItem[] => [
  {
    label: "Submitted By",
    value: <p className="text-lg">{data?.submitterName || BLANK_VALUE}</p>,
    canView: () => true,
  },
  {
    label: "Submission Source",
    value: <p className="text-lg">{data?.origin || BLANK_VALUE}</p>,
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
    value: <ReviewTeamList {...data} />,
    canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
  },
];
