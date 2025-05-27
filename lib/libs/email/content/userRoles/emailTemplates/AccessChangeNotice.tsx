import { BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { UserRoleEmailType } from "../index";
import { statesMap } from "../roleHelper";
import { getApprovingUserRoleLabel, statusMap, userRoleMap } from "../roleHelper";

export const AccessChangeNoticeEmail = ({ variables }: { variables: UserRoleEmailType }) => {
  const stateAccess = variables.territory === "N/A" ? "" : ` for ${statesMap[variables.territory]}`;
  const approvingRole = getApprovingUserRoleLabel(variables.role);

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
