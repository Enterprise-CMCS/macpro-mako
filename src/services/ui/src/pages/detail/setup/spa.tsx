import { removeUnderscoresAndCapitalize } from "@/utils";
import { isCmsUser } from "shared-utils";
import { LABELS } from "@/lib";
import { BLANK_VALUE } from "@/consts";
import { format } from "date-fns";
import { OsMainSourceItem } from "shared-types";
import { ReactNode } from "react";
import { OneMacUser } from "@/api/useGetUser";
import { ReviewTeamList } from "@/components/PackageDetails/ReviewTeamList";
import moment from "moment-timezone";

export type DetailSectionItem = {
  label: string;
  value: ReactNode;
  canView: (u: OneMacUser | undefined) => boolean;
};
export const spaDetails = (data: OsMainSourceItem): DetailSectionItem[] => [
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
      ? moment(data.submissionDate).tz("UTC").format("MM/DD/yyyy")
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Proposed Effective Date",
    value: data.proposedDate
      ? moment(data.proposedDate).tz("UTC").format("MM/DD/yyyy")
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Approved Effective Date",
    value: data.approvedEffectiveDate
      ? moment(data.approvedEffectiveDate).tz("UTC").format("MM/DD/yyyy")
      : BLANK_VALUE,
    canView: () => true,
  },
  {
    label: "Status Date",
    value: data.statusDate
      ? moment(data.statusDate).tz("UTC").format("MM/DD/yyyy")
      : BLANK_VALUE,
    canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
  },
  {
    label: "Final Disposition Date",
    value: data.finalDispositionDate
      ? moment(data.finalDispositionDate).tz("UTC").format("MM/DD/yyyy")
      : BLANK_VALUE,
    canView: () => true,
  },
];

export const submissionDetails = (
  data: OsMainSourceItem
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
    value: <ReviewTeamList team={data.reviewTeam} />,
    canView: (u) => (!u || !u.user ? false : isCmsUser(u.user)),
  },
];
