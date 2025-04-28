import { BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { statesMap } from "../types";
import { statusMap, userRoleMap } from "../types";

export type UserRoleEmailType = {
  role: keyof typeof userRoleMap;
  status: keyof typeof statusMap;
  applicationEndpointUrl: string;
  territory: keyof typeof statesMap | "N/A";
  fullName: string;
};

export const AccessChangeNoticeEmail = ({ variables }: { variables: UserRoleEmailType }) => {
  const stateAccess = variables.territory === "N/A" ? "" : ` for ${statesMap[variables.territory]}`;
  // TODO: fix - const approvingRole = userRoleMap[approvingUserRole[variables.role]];
  const approvingRole = userRoleMap[variables.role];
  return (
    <BaseEmailTemplate
      previewText={`Your access as a ${variables.role}${stateAccess} has been ${statusMap[variables.status]}.`}
      heading=""
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <p>Hello,</p>
      <p>
        Your access as a {userRoleMap[variables.role]}
        {stateAccess} has been {statusMap[variables.status]}. If you have any questions, please
        reach out to your {approvingRole}.
      </p>
    </BaseEmailTemplate>
  );
};
