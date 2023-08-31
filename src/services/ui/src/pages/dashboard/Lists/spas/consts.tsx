import { Link } from "react-router-dom";
import { format } from "date-fns";

import { removeUnderscoresAndCapitalize } from "@/utils";
import { getStatus } from "../statusHelper";
import { OsTableColumn } from "@/components/Opensearch/Table/types";

export const TABLE_COLUMNS = (props?: { isCms?: boolean }): OsTableColumn[] => [
  {
    props: { className: "tw-w-[150px]" },
    field: "id.keyword",
    label: "SPA ID",
    cell: (data) => {
      if (!data.authority) return <></>;
      return (
        <Link
          className="tw-cursor-pointer tw-text-blue-600"
          to={`/detail/${data.authority?.toLowerCase()}-spa?id=${encodeURIComponent(
            data.id
          )}`}
        >
          {data.id}
        </Link>
      );
    },
  },
  {
    field: "state.keyword",
    label: "State",
    cell: (data) => data.state,
  },
  {
    field: "planType.keyword",
    label: "Plan Type",
    cell: (data) => removeUnderscoresAndCapitalize(data.planType),
  },
  {
    field: "status.keyword",
    label: "Status",
    cell: (data) => getStatus(data.status, props?.isCms),
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
    field: "raiRequestedDate",
    label: "Formal RAI Requested",
    cell: (data) => {
      if (!data.raiRequestedDate) return null;
      return format(new Date(data.raiRequestedDate), "MM/dd/yyyy");
    },
  },
  {
    field: "raiReceivedDate",
    label: "Formal RAI Response",
    cell: (data) => {
      if (!data.raiReceivedDate) return null;
      return format(new Date(data.raiReceivedDate), "MM/dd/yyyy");
    },
  },
  {
    field: "submitterName.keyword",
    label: "Submitted By",
    cell: (data) => data.submitterName,
  },
];
