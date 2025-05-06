import { render } from "@react-email/render";

import {
  AccessChangeNoticeEmail,
  AccessPendingNoticeEmail,
  AdminPendingNoticeEmail,
  SelfRevokeAdminChangeEmail,
} from "./emailTemplates";
import { statesMap, statusMap, userRoleMap, userRoleType } from "./roleHelper";

export type UserRoleEmailType = {
  role: userRoleType;
  status: keyof typeof statusMap;
  applicationEndpointUrl: string;
  territory: keyof typeof statesMap | "N/A";
  fullName: string;
  email: string;
};

export const userRoleTemplate = {
  AccessChangeNotice: async (variables: UserRoleEmailType) => {
    const roleDisplay = userRoleMap[variables.role];
    const stateAccess =
      variables.territory === "N/A" ? "" : ` for ${statesMap[variables.territory]}`;
    return {
      to: [`${variables.fullName} <${variables.email}>`],
      subject: `Your OneMAC ${roleDisplay} Access${stateAccess} has been ${statusMap[variables.status]}`,
      body: await render(<AccessChangeNoticeEmail variables={variables} />),
    };
  },
  AccessPendingNotice: async (variables: UserRoleEmailType) => {
    return {
      to: [`${variables.fullName} <${variables.email}>`],
      subject: "Your OneMAC Role Access is Pending Review",
      body: await render(<AccessPendingNoticeEmail variables={variables} />),
    };
  },
  AdminPendingNotice: async (variables: UserRoleEmailType) => {
    const roleDisplay = userRoleMap[variables.role];
    //   TODO: add logic to actually get approverList?
    const approverList = [`${variables.fullName} <${variables.email}>`];
    return {
      to: approverList,
      subject: `New OneMAC ${roleDisplay} Access Request`,
      body: await render(<AdminPendingNoticeEmail variables={variables} />),
    };
  },
  SelfRevokeAdminChangeEmail: async (variables: UserRoleEmailType) => {
    const stateAccess =
      variables.territory === "N/A" ? "" : ` for ${statesMap[variables.territory]}`;
    //   TODO: add logic to actually get approverList?
    const approverList = [`${variables.fullName} <${variables.email}>`];
    return {
      to: approverList,
      subject: `OneMAC State access for ${stateAccess} was self-revoked by ${variables.fullName}`,
      body: await render(<SelfRevokeAdminChangeEmail variables={variables} />),
    };
  },
};
