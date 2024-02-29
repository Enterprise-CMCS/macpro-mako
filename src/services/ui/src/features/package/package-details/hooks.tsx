import { isCmsUser } from "shared-utils";

import { BLANK_VALUE } from "@/consts";
import { opensearch } from "shared-types";
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
  fullWidth?: boolean;
};
export const spaDetails = (
  data: opensearch.main.Document
): DetailSectionItem[] => [
  {
    label: "Submission ID",
    value: data.id,
    canView: () => true,
  },
  {
    label: "Authority",
    value: data?.authority,
    canView: () => true,
  },
  {
    label: "State",
    value: data.state,
    canView: () => true,
  },
  {
    label: "Subject",
    value: <p>{data?.subject || BLANK_VALUE}</p>,
    canView: () => true,
  },
  {
    label: "Type",
    value: data.type ?? BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Sub Type",
    value: data.subType ?? BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Initial submission date",
    value: data.submissionDate
      ? formatSeatoolDate(data.submissionDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Proposed effective date",
    value: data.proposedDate
      ? formatSeatoolDate(data.proposedDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Formal RAI received",
    value: data.raiReceivedDate
      ? formatSeatoolDate(data.raiReceivedDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Status Date",
    value: data.statusDate ? formatSeatoolDate(data.statusDate) : BLANK_VALUE,
    canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
  },
];

export const approvedAndAEffectiveDetails = (
  data: opensearch.main.Document
): DetailSectionItem[] => [
  {
    label: "Final disposition date",
    value: data.finalDispositionDate
      ? formatSeatoolDate(data.finalDispositionDate)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Approved effective date",
    value: data.approvedEffectiveDate
      ? formatSeatoolDate(data.approvedEffectiveDate)
      : BLANK_VALUE,
    canView: () => true,
  },
];

export const descriptionDetails = (
  data: opensearch.main.Document
): DetailSectionItem[] => [
  {
    label: "Description",
    value: data.description ?? BLANK_VALUE,
    canView: () => true,
  },
];

export const submissionDetails = (
  data: opensearch.main.Document
): DetailSectionItem[] => [
  {
    label: "Submitted by",
    value: <p className="text-lg">{data?.submitterName || BLANK_VALUE}</p>,
    canView: () => true,
  },
  {
    label: "Submission source",
    value: <p className="text-lg">{data?.origin || BLANK_VALUE}</p>,
    canView: () => true,
  },
  {
    label: "CPOC",
    value: <p className="text-lg">{data?.leadAnalystName || BLANK_VALUE}</p>,
    canView: () => true,
  },
  {
    label: "CPOC email",
    value: <ReviewTeamList {...data} />,
    canView: () => true,
  },
];
