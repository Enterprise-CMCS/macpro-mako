import { formatActionType, formatSeatoolDate, isCmsUser, isStateUser } from "shared-utils";

import { OneMacUser } from "@/api/useGetUser";
import { BLANK_VALUE } from "@/consts";
import { useState, ReactNode } from "react";
import { Authority, opensearch } from "shared-types";

import { convertStateAbbrToFullName } from "@/utils";
import { format } from "date-fns";

type ReviewTeamListProps = {
  reviewTeam: opensearch.main.Document["reviewTeam"];
};

const ReviewTeamList = ({ reviewTeam = [] }: ReviewTeamListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayTeam = isExpanded ? reviewTeam : reviewTeam.slice(0, 3);

  if (displayTeam.length === 0) {
    return BLANK_VALUE;
  }

  return (
    <ul>
      {displayTeam.map((reviewer, idx) => (
        <li key={`reviewteam-ul-${reviewer.name}-${idx}`}>{reviewer.name}</li>
      ))}
      {reviewTeam && reviewTeam?.length > 3 && (
        <li className={"text-xs text-sky-700 hover:cursor-pointer"}>
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Show less" : "Show more"}
          </button>
        </li>
      )}
    </ul>
  );
};

export type DetailSectionItem = {
  label: string;
  value: ReactNode;
  canView?: boolean;
};

type GetLabelAndValueFromSubmission = (
  submission: opensearch.main.Document,
  user: OneMacUser,
) => DetailSectionItem[];

export const getSubmissionDetails: GetLabelAndValueFromSubmission = (submission, { user }) => [
  {
    label: "Submission ID",
    value: submission.id,
  },
  {
    label: "Authority",
    value: submission.authority,
  },
  {
    label: "Action Type",
    value: formatActionType(submission.actionType),
    canView: ([Authority["1915b"], Authority["1915c"]] as string[]).includes(submission.authority),
  },
  {
    label: "State",
    value: convertStateAbbrToFullName(submission.state),
  },
  {
    label: "Amendment Title",
    value: <p>{submission.title || BLANK_VALUE}</p>,
    canView: submission.title !== undefined,
  },
  {
    label: "Subject",
    value: <p>{submission.subject || BLANK_VALUE}</p>,
    canView: isCmsUser(user) && submission.actionType !== "Extend",
  },
  {
    label: "Type",
    value: submission.types
      ? submission.types.map((type) => <p key={type?.SPA_TYPE_ID}>{type?.SPA_TYPE_NAME}</p>)
      : BLANK_VALUE,
    canView: submission.actionType !== "Extend" && isStateUser(user) === false,
  },
  {
    label: "Subtype",
    value: submission.subTypes
      ? submission.subTypes.map((T) => <p key={T?.TYPE_ID}>{T?.TYPE_NAME}</p>)
      : BLANK_VALUE,
    canView: submission.actionType !== "Extend" && isStateUser(user) === false,
  },
  {
    label: "Approved Initial or Renewal Number",
    value: submission.originalWaiverNumber,
    canView: submission.actionType === "Extend",
  },
  {
    label: "Proposed effective date",
    value: submission.proposedDate ? formatSeatoolDate(submission.proposedDate) : "Pending",
    canView: submission.actionType !== "Extend",
  },
  {
    label: "Initial submission date",
    value: submission.submissionDate ? formatSeatoolDate(submission.submissionDate) : BLANK_VALUE,
  },
  {
    label: "Latest package activity",
    value: submission.makoChangedDate
      ? format(new Date(submission.makoChangedDate).getTime(), "eee, MMM d yyyy, hh:mm:ss a")
      : BLANK_VALUE,
  },
  {
    label: "Formal RAI response date",
    value: submission.raiReceivedDate ? formatSeatoolDate(submission.raiReceivedDate) : BLANK_VALUE,
    canView: submission.actionType !== "Extend",
  },
];

export const getApprovedAndEffectiveDetails: GetLabelAndValueFromSubmission = (submission) => [
  {
    label: "Final disposition date",
    value: submission.finalDispositionDate
      ? formatSeatoolDate(submission.finalDispositionDate)
      : BLANK_VALUE,
    canView: submission.actionType !== "Extend",
  },
  {
    label: "Approved effective date",
    value: submission.approvedEffectiveDate
      ? formatSeatoolDate(submission.approvedEffectiveDate)
      : BLANK_VALUE,
    canView: submission.actionType !== "Extend",
  },
];

export const getDescriptionDetails: GetLabelAndValueFromSubmission = (submission, { user }) => [
  {
    label: "Description",
    value: submission.description || BLANK_VALUE,
    canView: isCmsUser(user) && submission.actionType !== "Extend",
  },
];

export const getSubmittedByDetails: GetLabelAndValueFromSubmission = (submission, { user }) => [
  {
    label: "Submitted by",
    value: <p className="text-lg">{submission.submitterName || BLANK_VALUE}</p>,
  },
  {
    label: "CPOC",
    value: <p className="text-lg">{submission.leadAnalystName || BLANK_VALUE}</p>,
    canView: submission.actionType !== "Extend",
  },
  {
    label: "Review Team (SRT)",
    value: <ReviewTeamList reviewTeam={submission.reviewTeam} />,
    canView: isCmsUser(user) && submission.actionType !== "Extend",
  },
];
