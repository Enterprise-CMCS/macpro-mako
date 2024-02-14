import { useGetUser } from "@/api";
import { UserRoles } from "shared-types";
import { DEFAULT_FILTERS, useOsUrl } from "../../useOpensearch";
import { opensearch } from "shared-types";
import { LABELS } from "@/utils/labels";
import { BLANK_VALUE } from "@/consts";
import { formatSeatoolDate } from "shared-utils";
import { getMainExportData } from "@/api";

export const useFilterExportGroups = () => {
  const { data: user } = useGetUser();
  const url = useOsUrl();

  const onExport = () =>
    getMainExportData(
      url.state.filters.concat(DEFAULT_FILTERS[url.state.tab]?.filters ?? [])
    );

  const headers: opensearch.main.ExportHeader[] = [
    {
      name: (() => {
        if (url.state.tab === "spas") return "SPA ID";
        if (url.state.tab === "waivers") return "Waiver Number";
        return "";
      })(),
      transform: (data) => data.id,
    },
    {
      name: "State",
      transform: (data) => data.state ?? BLANK_VALUE,
    },
    {
      name: "Type",
      transform: (data) => data.authority ?? BLANK_VALUE,
    },
    ...((): opensearch.main.ExportHeader[] => {
      if (url.state.tab !== "waivers") return [];
      return [
        {
          name: "Action Type",
          transform: (data) => {
            if (data.actionType === undefined) {
              return BLANK_VALUE;
            }

            return (
              LABELS[data.actionType as keyof typeof LABELS] || data.actionType
            );
          },
        },
      ];
    })(),
    {
      name: "Status",
      transform: (data) => {
        const status = (() => {
          if (!user?.isCms) return data.stateStatus;
          if (user?.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)) {
            return data.stateStatus;
          }
          return data.cmsStatus;
        })();

        const subStatusRAI = data.raiWithdrawEnabled
          ? " (Withdraw Formal RAI Response - Enabled)"
          : "";

        const subStatusInitialIntake = (() => {
          if (!user?.isCms) return "";
          if (!data.initialIntakeNeeded) return "";
          return " (Initial Intake Needed)";
        })();

        return `${status}${subStatusRAI}${subStatusInitialIntake}`;
      },
    },
    {
      name: "Initial Submission",
      transform: (data) =>
        data?.submissionDate
          ? formatSeatoolDate(data.submissionDate)
          : BLANK_VALUE,
    },
    {
      name: "Formal RAI Response",
      transform: (data) => {
        return data.raiReceivedDate && !data.raiWithdrawnDate
          ? formatSeatoolDate(data.raiReceivedDate)
          : BLANK_VALUE;
      },
    },
    {
      name: "CPOC Name",
      transform: (data) => data.leadAnalystName ?? BLANK_VALUE,
    },
    {
      name: "Submitted By",
      transform: (data) => data.submitterName ?? BLANK_VALUE,
    },
  ];

  return { onExport, headers };
};
