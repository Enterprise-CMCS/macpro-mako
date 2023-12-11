import { Link } from "react-router-dom";
import { format } from "date-fns";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { OsTableColumn } from "@/components/Opensearch/Table/types";
import { UserRoles } from "shared-types";
import { mapActionLabel } from "@/utils";
import { useGetUser } from "@/api/useGetUser";
import { packageActionsForResult } from "shared-utils";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import * as POP from "@/components/Popover";
import { cn } from "@/lib";

export const useSpaTableColumns = (): OsTableColumn[] => {
  const { data: props } = useGetUser();

  if (!props?.user) return [];

  return [
    {
      props: { className: "w-[150px]" },
      field: "id.keyword",
      label: "SPA ID",
      locked: true,
      cell: (data) => {
        if (!data.authority) return <></>;
        return (
          <Link
            className="cursor-pointer text-blue-600"
            to={`/details?id=${encodeURIComponent(data.id)}`}
          >
            {data.id}
          </Link>
        );
      },
    },
    {
      field: "state.keyword",
      label: "State",
      visible: true,
      cell: (data) => data.state,
    },
    {
      field: "planType.keyword",
      label: "Type",
      cell: (data) => removeUnderscoresAndCapitalize(data.planType),
    },
    {
      field: props?.isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
      label: "Status",
      cell: (data) =>
        props?.isCms &&
        !(props.user?.["custom:cms-roles"] === UserRoles.HELPDESK)
          ? data.cmsStatus
          : data.stateStatus,
    },
    {
      field: "submissionDate",
      label: "Initial Submission",
      cell: (data) => {
        if (!data.submissionDate) return null;
        return format(new Date(data.submissionDate), "MM/dd/yyyy");
      },
    },
    {
      field: "origin",
      label: "Submission Source",
      visible: false,
      cell: (data) => {
        if (data.origin?.toLowerCase() === "onemac") {
          return "OneMAC";
        }
        return data.origin;
      },
    },
    {
      field: "raiRequestedDate",
      label: "Formal RAI Requested",
      visible: false,
      cell: (data) => {
        if (!data.raiRequestedDate) return null;
        return format(new Date(data.raiRequestedDate), "MM/dd/yyyy");
      },
    },
    {
      field: "raiReceivedDate",
      label: "Formal RAI Response",
      cell: (data) => {
        if (!data.raiReceivedDate || data.raiWithdrawnDate) return null;
        return format(new Date(data.raiReceivedDate), "MM/dd/yyyy");
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
    {
      locked: true,
      isSystem: true,
      label: "Actions",
      cell: (data) => {
        if (!props.user) return <></>;
        const actions = packageActionsForResult(props?.user, data);
        return (
          <>
            <POP.Popover>
              <POP.PopoverTrigger disabled={!actions.length}>
                <EllipsisVerticalIcon
                  className={cn(
                    "w-8",
                    actions.length ? "text-blue-700" : "text-gray-400"
                  )}
                />
              </POP.PopoverTrigger>
              <POP.PopoverContent>
                <div className="flex flex-col">
                  {actions.map((action, idx) => {
                    return (
                      <Link
                        className={cn(
                          "text-blue-500",
                          "relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        )}
                        to={`/action/${data.id}/${action}`}
                        key={`${idx}-${action}`}
                      >
                        {mapActionLabel(action)}
                      </Link>
                    );
                  })}
                </div>
              </POP.PopoverContent>
            </POP.Popover>
          </>
        );
      },
    },
  ];
};
