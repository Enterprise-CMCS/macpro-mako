import { removeUnderscoresAndCapitalize } from "@/utils";
import { OsTableColumn } from "@/components";
import { CMS_READ_ONLY_ROLES, UserRoles } from "shared-types";
import { useGetUser } from "@/api";
import {
  renderCellActions,
  renderCellDate,
  renderCellIdLink,
} from "../renderCells";
import { BLANK_VALUE } from "@/consts";
import { formatSeatoolDate } from "shared-utils";

export const useSpaTableColumns = (): OsTableColumn[] => {
  const { data: props } = useGetUser();

  if (!props?.user) return [];

  return [
    {
      props: { className: "w-[150px]" },
      field: "id.keyword",
      label: "SPA ID",
      locked: true,
      cell: renderCellIdLink((id) => `/details?id=${encodeURIComponent(id)}`),
    },
    {
      field: "state.keyword",
      label: "State",
      visible: true,
      cell: (data) => data.state,
    },
    {
      field: "authority.keyword",
      label: "Authority",
      cell: (data) =>
        data?.authority
          ? removeUnderscoresAndCapitalize(data.authority)
          : BLANK_VALUE,
    },
    {
      field: props?.isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
      label: "Status",
      cell: (data) => {
        const status = (() => {
          if (!props?.isCms) return data.stateStatus;
          if (props.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK))
            return data.stateStatus;
          return data.cmsStatus;
        })();

        return (
          <>
            <p>{status}</p>
            {data.raiWithdrawEnabled && (
              <p className="text-xs opacity-60">
                · Withdraw Formal RAI Response - Enabled
              </p>
            )}
            {props?.isCms && data.initialIntakeNeeded && (
              <p className="text-xs opacity-60">· Initial Intake Needed</p>
            )}
          </>
        );
      },
    },
    {
      field: "submissionDate",
      label: "Initial Submission",
      cell: renderCellDate("submissionDate"),
    },
    {
      field: "origin",
      label: "Submission Source",
      visible: false,
      cell: (data) => {
        return data.origin;
      },
    },
    {
      field: "raiRequestedDate",
      label: "Formal RAI Requested",
      visible: false,
      cell: renderCellDate("raiRequestedDate"),
    },
    {
      field: "raiReceivedDate",
      label: "Formal RAI Response",
      cell: (data) => {
        if (!data.raiReceivedDate || data.raiWithdrawnDate) return null;
        return formatSeatoolDate(data.raiReceivedDate);
      },
    },
    {
      field: "leadAnalystName.keyword",
      label: "CPOC Name",
      visible: false,
      cell: (data) => data.leadAnalystName,
    },
    {
      field: "submitterName.keyword",
      label: "Submitted By",
      cell: (data) => data.submitterName,
    },
    // hide actions column for: readonly,help desk
    ...(!CMS_READ_ONLY_ROLES.some((UR) =>
      props.user?.["custom:cms-roles"].includes(UR)
    )
      ? [
          {
            locked: true,
            isSystem: true,
            label: "Actions",
            cell: renderCellActions(props.user),
          },
        ]
      : []),
  ];
};
