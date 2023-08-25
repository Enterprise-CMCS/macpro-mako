import { Link } from "react-router-dom";
import { format } from "date-fns";

import { removeUnderscoresAndCapitalize } from "@/utils";
import { getStatus } from "../statusHelper";
import { OsTableColumn } from "@/components/Opensearch/Table/types";

export const TABLE_COLUMNS = (props?: { isCms?: boolean }): OsTableColumn[] => [
  {
    props: { className: "w-[150px]" },
    field: "id.keyword",
    label: "Waiver ID",
    cell: (data) => {
      if (!data.authority) return <></>;
      return (
        <Link
          className="cursor-pointer text-blue-600"
          to={`/detail/${data.authority?.toLowerCase()}?id=${encodeURIComponent(
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
      return format(data.submissionDate, "MM/dd/yyyy");
    },
  },
  {
    field: "raiReceivedDate.RAI_RECEIVED_DATE",
    label: "Formal Rai Response",
    cell: (data) => {
      if (!data.raiReceivedDate?.RAI_RECEIVED_DATE) return null;
      return format(data.raiReceivedDate?.RAI_RECEIVED_DATE, "MM/dd/yyyy");
    },
  },
  {
    field: "submitterName.keyword",
    label: "Submitted By",
    cell: (data) => data.submitterName,
  },
];
