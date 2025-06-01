import { useMemo } from "react";
import { opensearch } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { formatDateToET } from "shared-utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  DetailsSection,
  GridAccordionTrigger,
} from "@/components";
import { BLANK_VALUE } from "@/consts";

type AdminChangeProps = {
  adminActivity: opensearch.changelog.Document;
};

const AC_WithdrawEnabled = ({ adminActivity }: AdminChangeProps) => (
  <div className="col-span-full py-4 grid gap-y-2">
    <p className="font-bold">Change made</p>
    <p>
      {adminActivity.submitterName} has enabled State package action to withdraw formal RAI response
    </p>
  </div>
);

const AC_WithdrawDisabled = ({ adminActivity }: AdminChangeProps) => (
  <div className="col-span-full py-4 grid gap-y-2">
    <p className="font-bold">Change made</p>
    <p>
      {adminActivity.submitterName} has disabled State package action to withdraw formal RAI
      response
    </p>
  </div>
);

const AC_LegacyAdminChange = ({ adminActivity }: AdminChangeProps) => (
  <div className="col-span-full py-4 grid gap-y-6">
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
function checkRegexPatterns(input: string): string {
  // Check which pattern matches
  const enabledPattern = /enabled.*withdraw Formal RAI Response/;
  const disabledPattern = /disabled.*withdraw Formal RAI Response/;
  switch (true) {
    case enabledPattern.test(input):
      return "Enable Formal RAI Response Withdraw";

    case disabledPattern.test(input):
      return "Disable Formal RAI Response Withdraw";

    default:
      return "";
  }
}
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
        return [
          checkRegexPatterns(adminActivity.changeMade) || "Manual Update",
          AC_LegacyAdminChange,
        ];
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
      <GridAccordionTrigger
        className="bg-gray-100 px-3 text-gray-600"
        showPlusMinus
        col1={<strong>{label as string}</strong>}
        col2=" - "
        col3={formatDateToET(adminActivity.timestamp)}
      />
      <AccordionContent>
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
      childrenClassName="grid gap-y-8"
    >
      <Accordion
        // There is a cached value (defaultValue) below
        // If you ever want to get around the cached value so
        // that is re-renders simply use a unique key that will
        // change when you need it to re-render
        key={adminChangelog[0]._source.id}
        type="multiple"
        defaultValue={[adminChangelog[0]._source.id]}
        className="grid grid-cols-1 gap-y-2"
      >
        {adminChangelog.map(({ _source: adminActivity }) => (
          <AdminChange key={adminActivity.id} adminActivity={adminActivity} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
