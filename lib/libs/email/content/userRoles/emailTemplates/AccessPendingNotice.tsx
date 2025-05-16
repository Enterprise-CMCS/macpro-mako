import { formatDate } from "shared-utils";

import { BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { UserRoleEmailType } from "../index";
import { userRoleMap } from "../roleHelper";

export const AccessPendingNoticeEmail = ({ variables }: { variables: UserRoleEmailType }) => {
  const requestDate = formatDate(Date.now());
  const roleFormated = userRoleMap[variables.role];
  return (
    <BaseEmailTemplate
      previewText={`We received your request as a ${roleFormated} on ${requestDate}`}
      heading=""
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <p>Hello,</p>
      <p>
        We received your request as a {roleFormated} on {requestDate}. Your request is pending
        review and you will receive a confirmation receipt when your status is reviewed.
      </p>
    </BaseEmailTemplate>
  );
};
