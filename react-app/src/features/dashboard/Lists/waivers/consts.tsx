import { useEffect, useState } from "react";
import { CMS_READ_ONLY_ROLES, SEATOOL_STATUS, UserRoles } from "shared-types";
import { formatActionType, formatDateToET, formatDateToUTC } from "shared-utils";

import { useGetUser } from "@/api";
import { OsTableColumn } from "@/components";
import { BLANK_VALUE } from "@/consts";
import { removeUnderscoresAndCapitalize } from "@/utils";

import { CellDetailsLink, renderCellActions, renderCellDate } from "../renderCells";

const getColumns = (props) => {
  if (!props?.user || props.user === null) {
    return [];
  }
  return [
    // hide actions column for: readonly,help desk
    ...(!CMS_READ_ONLY_ROLES.some((UR) => props.user?.role === UR)
      ? [
          {
            locked: true,
            isSystem: true,
            label: "Actions",
            cell: renderCellActions(props.user),
          },
        ]
      : []),
    {
      props: { className: "w-[200px]" },
      field: "id.keyword",
      label: "Waiver Number",
      locked: true,
      transform: (data) => data.id,
      cell: ({ id, authority }) => <CellDetailsLink id={id} authority={authority} />,
    },
    {
      field: "state.keyword",
      label: "State",
      transform: (data) => data.state ?? BLANK_VALUE,
      cell: (data) => data.state,
    },
    {
      field: "authority.keyword",
      label: "Authority",
      transform: (data) => data.authority ?? BLANK_VALUE,
      cell: (data) =>
        data?.authority ? removeUnderscoresAndCapitalize(data.authority) : BLANK_VALUE,
    },
    {
      field: "actionType.keyword",
      label: "Action Type",
      transform: (data) => formatActionType(data.actionType),
      cell: (data) => formatActionType(data.actionType),
    },
    {
      field: props?.isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
      label: "Status",
      transform: (data) => {
        const status = (() => {
          if (!props?.isCms) return data.stateStatus;
          if (props?.user?.role === UserRoles.HELPDESK) {
            return data.stateStatus;
          }
          return data.cmsStatus;
        })();

        const subStatusRAI = data.raiWithdrawEnabled
          ? " (Withdraw Formal RAI Response - Enabled)"
          : "";

        return `${status}${subStatusRAI}`;
      },
      cell: (data) => {
        const status = (() => {
          if (!props?.isCms) return data.stateStatus;
          if (props.user?.role === UserRoles.HELPDESK) return data.stateStatus;
          return data.cmsStatus;
        })();

        return (
          <>
            <p>{status}</p>
            {data.raiWithdrawEnabled &&
              data.seatoolStatus !== SEATOOL_STATUS.PENDING_APPROVAL &&
              data.seatoolStatus !== SEATOOL_STATUS.PENDING_CONCURRENCE && (
                <p className="text-xs opacity-65">· Withdraw Formal RAI Response - Enabled</p>
              )}
          </>
        );
      },
    },
    {
      field: "submissionDate",
      label: "Initial Submission",
      transform: (data) =>
        data?.submissionDate
          ? formatDateToET(data.submissionDate, "MM/dd/yyyy", false)
          : BLANK_VALUE,
      cell: renderCellDate("submissionDate"),
    },
    {
      field: "finalDispositionDate",
      label: "Final Disposition",
      hidden: true,
      cell: (data) =>
        data?.finalDispositionDate
          ? formatDateToUTC(data.finalDispositionDate, "MM/dd/yyyy")
          : BLANK_VALUE,
    },
    {
      field: "makoChangedDate",
      label: "Latest Package Activity",
      transform: (data) =>
        data.makoChangedDate
          ? formatDateToET(data.makoChangedDate, "MM/dd/yyyy", false)
          : BLANK_VALUE,
      cell: renderCellDate("makoChangedDate"),
    },
    {
      field: "raiRequestedDate",
      label: "Formal RAI Requested",
      hidden: true,
      cell: (data) =>
        data?.raiRequestedDate ? formatDateToUTC(data.raiRequestedDate, "MM/dd/yyyy") : BLANK_VALUE,
    },
    {
      field: "raiReceivedDate",
      label: "Formal RAI Response",
      transform: (data) => {
        return data.raiReceivedDate
          ? formatDateToET(data.raiReceivedDate, "MM/dd/yyyy", false)
          : BLANK_VALUE;
      },
      cell: renderCellDate("raiReceivedDate"),
    },
    {
      field: "leadAnalystName.keyword",
      label: "CPOC Name",
      hidden: true,
      transform: (data) => data.leadAnalystName ?? BLANK_VALUE,
      cell: (data) => data.leadAnalystName,
    },
    {
      field: "submitterName.keyword",
      label: "Submitted By",
      transform: (data) => data.submitterName ?? BLANK_VALUE,
      cell: (data) => data.submitterName,
    },
  ];
};

export const useWaiverTableColumns = (): { columns?: OsTableColumn[]; isLoading: boolean } => {
  const [columns, setColumns] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { data: props, isLoading: isUserLoading } = useGetUser();

  useEffect(() => {
    if (isUserLoading === true) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setColumns(getColumns(props));
    }
  }, [props, isUserLoading]);

  return { columns, isLoading };
};
