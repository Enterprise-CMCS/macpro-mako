import { useMemo } from "react";
import { opensearch } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { formatDateToET } from "shared-utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  DetailsSection,
} from "@/components";
import { BLANK_VALUE } from "@/consts";

type AdminChangeProps = {
  adminActivity: opensearch.changelog.Document;
};

const AC_WithdrawEnabled = ({ adminActivity }: AdminChangeProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-bold">Change made</p>
    <p>
      {adminActivity.submitterName} has enabled State package action to withdraw formal RAI response
    </p>
  </div>
);

const AC_WithdrawDisabled = ({ adminActivity }: AdminChangeProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-bold">Change made</p>
    <p>
      {adminActivity.submitterName} has disabled State package action to withdraw formal RAI
      response
    </p>
  </div>
);

const AC_LegacyAdminChange = ({ adminActivity }: AdminChangeProps) => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="font-bold text-lg mb-2">Change Made</h2>
      <p>{adminActivity.changeMade || "No information submitted"}</p>
    </div>
    {adminActivity.changeReason && (
      <div>
        <h2 className="font-bold text-lg mb-2">Change Reason</h2>
        <p>{adminActivity.changeReason}</p>
      </div>
    )}
  </div>
);

const AC_Update = () => <p>Coming Soon</p>;

export const AdminChange = ({ adminActivity }: AdminChangeProps) => {
  const [label, Content] = useMemo(() => {
    switch (adminActivity.event) {
      case "toggle-withdraw-rai": {
        if (adminActivity.raiWithdrawEnabled) {
          return ["Enable Formal RAI Response Withdraw", AC_WithdrawEnabled];
        }
        return ["Disable Formal RAI Response Withdraw", AC_WithdrawDisabled];
      }
      case "NOSO":
        return [adminActivity.changeType || "Package Added", AC_LegacyAdminChange];
      case "legacy-admin-change":
        return [adminActivity.changeType || "Manual Update", AC_LegacyAdminChange];
      case "split-spa":
        return ["Package Added", AC_LegacyAdminChange];
      case "update-id":
        return ["Manual Update", AC_LegacyAdminChange];
      case "update-values":
        return ["Manual Update", AC_LegacyAdminChange];
      default:
        return [BLANK_VALUE, AC_Update];
    }
  }, [adminActivity.event, adminActivity.changeType, adminActivity.raiWithdrawEnabled]);

  return (
    <AccordionItem value={adminActivity.id}>
      <AccordionTrigger className="bg-gray-100 px-3" showPlusMinus>
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{label as string}</strong>
          {" - "}
          {formatDateToET(adminActivity.timestamp)}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Content adminActivity={adminActivity} />
      </AccordionContent>
    </AccordionItem>
  );
};

type AdminChangesProps = {
  changelog: ItemResult[];
};

export const AdminPackageActivities = ({ changelog }: AdminChangesProps) => {
  const adminChangelog = changelog.filter((item) => item._source.isAdminChange);

  if (adminChangelog.length === 0) return null;

  return (
    <DetailsSection
      id="administrative_package_changes"
      title={`Administrative Package Changes (${adminChangelog.length})`}
      description="Administrative changes reflect updates to specific data fields. If you have additional questions, please contact the assigned CPOC."
    >
      <Accordion
        // There is a cached value (defaultValue) below
        // If you ever want to get around the cached value so
        // that is re-renders simply use a unique key that will
        // change when you need it to re-render
        key={adminChangelog[0]._source.id}
        type="multiple"
        defaultValue={[adminChangelog[0]._source.id]}
        className="flex flex-col gap-2"
      >
        {adminChangelog.map(({ _source: adminActivity }) => {
          return <AdminChange key={adminActivity.id} adminActivity={adminActivity} />;
        })}
      </Accordion>
    </DetailsSection>
  );
};
