import { SearchForm } from "@/components";
import { FC } from "react";
import { DEFAULT_FILTERS, useOsParams } from "../useOpensearch";
import { ExportButton } from "@/components/ExportButton";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./FilterDrawer";
import { getAllSearchData } from "@/api";
import { useGetUser } from "@/api/useGetUser";
import { BLANK_VALUE } from "@/consts";
import { format } from "date-fns";
import { LABELS } from "@/lib/labels";

export const OsFiltering: FC<{
  disabled?: boolean;
}> = (props) => {
  const params = useOsParams();
  const context = useOsContext();
  const user = useGetUser();
  const filters = DEFAULT_FILTERS[params.state.tab]?.filters ?? [];

  return (
    <div>
      <p className="mb-1 text-sm text-slate-400">
        {"Search by Package ID, CPOC Name, or Submitter Name"}
      </p>
      <div className="flex flex-row content-between gap-2 mb-4">
        <SearchForm
          isSearching={context.isLoading}
          handleSearch={(search) =>
            params.onSet((s) => ({
              ...s,
              pagination: { ...s.pagination, number: 0 },
              search,
            }))
          }
          disabled={!!props.disabled}
        />
        <div className="flex flex-row gap-2">
          <ExportButton
            data={() => getAllSearchData([...params.state.filters, ...filters])}
            headers={[
              {
                name: (() => {
                  if (params.state.tab === "spas") {
                    return "SPA ID";
                  } else if (params.state.tab === "waivers") {
                    return "Waiver Number";
                  }
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
                transform: (data) => data.planType ?? BLANK_VALUE,
              },
              {
                name: "Action Type",
                transform: (data) => {
                  if (data.actionType === undefined) {
                    return BLANK_VALUE;
                  }

                  return (
                    LABELS[data.actionType as keyof typeof LABELS] ||
                    data.actionType
                  );
                },
              },
              {
                name: "Status",
                transform(data) {
                  if (user?.data?.isCms && !user?.data?.user) {
                    if (data.cmsStatus) {
                      return data.cmsStatus;
                    }
                    return BLANK_VALUE;
                  } else {
                    if (data.stateStatus) {
                      return data.stateStatus;
                    }
                    return BLANK_VALUE;
                  }
                },
              },
              {
                name: "Initial Submission",
                transform: (data) =>
                  data?.submissionDate
                    ? format(new Date(data.submissionDate), "MM/dd/yyyy")
                    : BLANK_VALUE,
              },
              {
                name: "Formal RAI Response",
                transform: (data) => {
                  return data.raiReceivedDate
                    ? format(new Date(data.raiReceivedDate), "MM/dd/yyyy")
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
            ]}
          />
          <OsFilterDrawer />
        </div>
      </div>
    </div>
  );
};

export * from "./FilterChips";
export * from "./FilterProvider";
