import { Link } from "react-router-dom";
import { format } from "date-fns";

import { removeUnderscoresAndCapitalize } from "@/utils";
import { getStatus } from "../statusHelper";
import { OsTableColumn } from "@/components/Opensearch/Table/types";
import { LABELS } from "@/lib";

export const TABLE_COLUMNS = (props?: { isCms?: boolean }): OsTableColumn[] => [
  {
    props: { className: "w-[150px]" },
    field: "id.keyword",
    label: "Waiver Number",
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
    cell: (data) => data.state,
  },
  {
    field: "planType.keyword",
    label: "Type",
    cell: (data) => removeUnderscoresAndCapitalize(data.planType),
  },
  {
    field: "actionType.keyword",
    label: "Sub Type",
    cell: (data) =>
      data.actionType
        ? LABELS[data.actionType as keyof typeof LABELS] || data.actionType
        : "",
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
  {
    field: "leadAnalystName.keyword",
    label: "CPOC",
    cell: (data) => data.leadAnalystName,
  },
];
