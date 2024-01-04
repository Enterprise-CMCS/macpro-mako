import { removeUnderscoresAndCapitalize } from "@/utils";
import { isCmsUser } from "shared-utils";
import { LABELS } from "@/lib";
import { BLANK_VALUE } from "@/consts";
import { format } from "date-fns";
import { opensearch } from "shared-types";
import { ReactNode } from "react";
import { OneMacUser } from "@/api/useGetUser";
import { ReviewTeamList } from "@/components/PackageDetails/ReviewTeamList";

export type DetailSectionItem = {
  label: string;
  value: ReactNode;
  canView: (u: OneMacUser | undefined) => boolean;
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
    label: "State",
    value: data.state,
    canView: () => true,
  },
  {
    label: "Type",
    value: data?.planType
      ? removeUnderscoresAndCapitalize(data.planType)
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Initial Submission Date",
    value: data.submissionDate
      ? format(new Date(data.submissionDate), "MM/dd/yyyy h:mm:ss a")
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Proposed Effective Date",
    value: data.proposedDate
      ? format(new Date(data.proposedDate), "MM/dd/yyyy")
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Approved Effective Date",
    value: data.approvedEffectiveDate
      ? format(new Date(data.approvedEffectiveDate), "MM/dd/yyyy h:mm:ss a")
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Status Date",
    value: data.statusDate
      ? format(new Date(data.statusDate), "MM/dd/yyyy h:mm:ss a")
      : BLANK_VALUE,
    canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
  },
  {
    label: "Final Disposition Date",
    value: data.finalDispositionDate
      ? format(new Date(data.finalDispositionDate), "MM/dd/yyyy h:mm:ss a")
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
    value: (
      <p className="text-lg">
        {data?.origin?.toLowerCase() === "onemac" ? "OneMAC" : BLANK_VALUE}
      </p>
    ),
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
