import { getUserRoleTemplate } from "libs/email";
import { UserRoleEmailType } from "libs/email/content";
import { EmailAddresses } from "shared-types";
import { getSecret } from "shared-utils";

import {
  createEmailParams,
  ProcessEmailConfig,
  sendEmail,
  validateEmailTemplate,
} from "./processEmails";
import { getApproversByRoleState, getUserByEmail } from "./user-management/userManagementService";

export async function sendUserRoleEmails(
  valueParsed: UserRoleEmailType,
  timestamp: number,
  config: ProcessEmailConfig,
) {
  const record = {
    ...valueParsed,
    timestamp,
    applicationEndpointUrl: config.applicationEndpointUrl,
  };
  // if the status = pending -> AdminPendingNotice & AccessPendingNotice
  const templates = [];
  if (record.status === "pending") {
    templates.push(await getUserRoleTemplate("AccessPendingNotice"));
    templates.push(await getUserRoleTemplate("AdminPendingNotice"));
  }
  // if the status = denied AND doneByEmail = email -> SelfRevokeAdminChangeEmail
  else if (record.status === "denied" && record.doneByEmail === record.email) {
    templates.push(await getUserRoleTemplate("SelfRevokeAdminChangeEmail"));
  }
  // else -> AccessChangeNotice
  else {
    templates.push(await getUserRoleTemplate("AccessChangeNotice"));
  }

  // get the user's name
  if (templates.length) {
    try {
      const userInfo = await getUserByEmail(record.email, {
        domain: config.osDomain,
        index: `${config.indexNamespace}users`,
      });
      if (userInfo?.fullName) {
        record.fullName = userInfo.fullName;
      }
    } catch (error) {
      console.error("Error trying to get user name:", error);
    }
  }

  // get the approver list
  if (templates.length) {
    try {
      const approverList = await getApproversByRoleState(
        record.role,
        record.territory,
        {
          domain: config.osDomain,
          index: `${config.indexNamespace}roles`,
        },
        {
          domain: config.osDomain,
          index: `${config.indexNamespace}users`,
        },
      );

      if (!approverList.length) {
        console.log("NO APPROVERS FOUND");
      }

      const approverListFormated = approverList.map(
        (approver) => `${approver.fullName} <${approver.email}>`,
      );
      record.approverList = approverListFormated;
    } catch (error) {
      console.log("Error trying to get approver list: ", error);
    }
  }

  const results = [];

  const secret = await getSecret(config.emailAddressLookupSecretName);
  const emails: EmailAddresses = JSON.parse(secret);

  for (const template of templates) {
    try {
      const filledTemplate = await template(record);
      const currentCcEmails = filledTemplate?.cc ?? [];
      // This is used for injecting a test email for higher environments. If this
      // secret exists it will inject that secrets cc email into the user roles
      // email templates that get sent out (useful for testing email sending in dev, and val)
      const userRoleCc = emails.userRoleCc ? [emails.userRoleCc] : [];

      filledTemplate.cc = [...currentCcEmails, ...userRoleCc];

      validateEmailTemplate(filledTemplate);
      const params = createEmailParams(
        filledTemplate,
        emails.accessEmail,
        config.osDomain,
        config.isDev,
      );

      const result = await sendEmail(params, config.region);
      results.push({ success: true, result });
    } catch (error) {
      console.error("Error processing template:", error);
      results.push({ success: false, error });
      // Continue with next template instead of throwing
    }
  }
  return;
}
