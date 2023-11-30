import { format } from "date-fns";
import { OsMainSourceItem } from "shared-types";
import { isStateUser } from "shared-utils";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { LABELS } from "@/lib";
import { BLANK_VALUE } from "@/consts";
import { ReactNode } from "react";
import { useGetUser } from "@/api/useGetUser";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/routes";

export const SpaPackageDetails = (data: OsMainSourceItem) => {
  const { data: user } = useGetUser();
  if (!data || !user?.user) return <Navigate to={ROUTES.DASHBOARD} />;
  const detailFields: {
    label: string;
    value: typeof data[keyof OsMainSourceItem];
    visible: boolean;
  }[] = [
    {
      label: "Submission ID",
      value: data.id,
      visible: true,
    },
    {
      label: "State",
      value: data.state,
      visible: true,
    },
    {
      label: "Type",
      value: removeUnderscoresAndCapitalize(data.planType),
      visible: true,
    },
    {
      label: "Action Type",
      value: data.actionType
        ? LABELS[data.actionType as keyof typeof LABELS] || data.actionType
        : BLANK_VALUE,
      visible: true,
    },
    {
      label: "Initial Submission Date",
      value: data.submissionDate
        ? format(new Date(data.submissionDate), "MM/dd/yyyy h:mm:ss a")
        : BLANK_VALUE,
      visible: true,
    },
    {
      label: "Proposed Effective Date",
      value: data.proposedDate
        ? format(new Date(data.proposedDate), "MM/dd/yyyy")
        : BLANK_VALUE,
      visible: true,
    },
    {
      label: "Approved Effective Date",
      value: data.approvedEffectiveDate
        ? format(new Date(data.approvedEffectiveDate), "MM/dd/yyyy h:mm:ss a")
        : BLANK_VALUE,
      visible: true,
    },
    {
      label: "Status Date",
      value: data.changedDate
        ? format(new Date(data.changedDate), "MM/dd/yyyy h:mm:ss a")
        : BLANK_VALUE,
      visible: !isStateUser(user.user),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {detailFields.map(({ label, value, visible }) => {
        if (!visible) return;
        return (
          <div key={label}>
            <h3 className="text-sm">{label}</h3>
            <p className="text-lg">{value as ReactNode}</p>
          </div>
        );
      })}
    </div>
  );
};
