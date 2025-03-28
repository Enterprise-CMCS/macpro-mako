import { ReactNode, useState } from "react";
import { Authority, opensearch } from "shared-types";
import {
  formatActionType,
  formatDateToET,
  formatDateToUTC,
  isCmsUser,
  isStateUser,
} from "shared-utils";

import { OneMacUser } from "@/api/useGetUser";
import { BLANK_VALUE } from "@/consts";
import { convertStateAbbrToFullName } from "@/utils";

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
      {reviewTeam.length > 3 && (
        <li className={"text-xs text-sky-700 hover:cursor-pointer"}>
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Show less" : "Show more"}
          </button>
        </li>
      )}
    </ul>
  );
};

export type LabelAndValue = {
  label: string;
  value: ReactNode;
  canView?: boolean;
};

type GetLabelAndValueFromSubmission = (
  submission: opensearch.main.Document,
  user: OneMacUser,
) => LabelAndValue[];

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
    value: submission.title || BLANK_VALUE,
    canView: submission.title !== undefined,
  },
  {
    label: "Subject",
    value: submission.subject || BLANK_VALUE,
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
    label: "Proposed Effective Date",
    value: submission.proposedDate ? formatDateToUTC(submission.proposedDate) : "Pending",
    canView: submission.actionType !== "Extend",
  },
  {
    label: "Initial Submission Date",
    value: submission.submissionDate ? formatDateToET(submission.submissionDate) : BLANK_VALUE,
  },
  {
    label: "Latest Package Activity",
    value: submission.makoChangedDate ? formatDateToET(submission.makoChangedDate) : BLANK_VALUE,
  },
  {
    label: "Formal RAI Response Date",
    value: submission.raiReceivedDate ? formatDateToET(submission.raiReceivedDate) : BLANK_VALUE,
    canView: submission.actionType !== "Extend",
  },
];

export const getApprovedAndEffectiveDetails: GetLabelAndValueFromSubmission = (submission) => [
  {
    label: "Final Disposition Date",
    value: submission.finalDispositionDate
      ? formatDateToUTC(submission.finalDispositionDate)
      : BLANK_VALUE,
    canView: submission.actionType !== "Extend",
  },
  {
    label: "Approved Effective Date",
    value: submission.approvedEffectiveDate
      ? formatDateToUTC(submission.approvedEffectiveDate)
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
    label: "Submitted By",
    value: <p className="text-lg">{submission.submitterName || BLANK_VALUE}</p>,
  },
  {
    label: "CPOC",
    value: <p className="text-lg">{submission.leadAnalystName || BLANK_VALUE}</p>,
    canView: submission.actionType !== "Extend",
  },
  {
    label: "SRT",
    value: <ReviewTeamList reviewTeam={submission.reviewTeam} />,
    canView: isCmsUser(user) && submission.actionType !== "Extend",
  },
];
