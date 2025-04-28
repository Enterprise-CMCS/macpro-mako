import { BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { statesMap } from "../types";
import { userRoleMap } from "../types";
import { UserRoleEmailType } from "./AccessChangeNotice";

export const AdminPendingNoticeEmail = ({ variables }: { variables: UserRoleEmailType }) => {
  const stateAccess =
    variables.territory === "N/A" ? "" : ` for ${statesMap[variables.territory]} `;
  const roleFormated = userRoleMap[variables.role];
  return (
    <BaseEmailTemplate
      previewText={`There is a new OneMAC ${roleFormated} access request ${stateAccess}`}
      heading=""
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <p>Hello,</p>
      <p>
        There is a new OneMAC {roleFormated} access request {stateAccess}from {variables.fullName}{" "}
        waiting for your review. Please log into your User Management Dashboard to see the pending
        request.
      </p>
    </BaseEmailTemplate>
  );
};
