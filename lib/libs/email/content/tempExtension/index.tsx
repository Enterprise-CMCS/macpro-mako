import { EmailAddresses, OneMac } from "shared-types";
import { CommonVariables, UserTypeOnlyTemplate } from "../..";
import { render } from "@react-email/render";
import * as React from "react";
import { TempExtCMSEmail, TempExtStateEmail } from "./emailTemplates";

export const tempExtention: UserTypeOnlyTemplate = {
  cms: async (
    variables: OneMac & CommonVariables & { emails: EmailAddresses },
  ) => {
    return {
      to: variables.emails.osgEmail,
      subject: `${variables.authority} Waiver Extension ${variables.id} Submitted`,
      html: await render(<TempExtCMSEmail variables={variables} />),
      text: await render(<TempExtCMSEmail variables={variables} />, {
        plainText: true,
      }),
    };
  },
  state: async (variables: OneMac & CommonVariables) => {
    return {
      to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
      subject: `Your Request for the ${variables.authority} Waiver Extension ${variables.id} has been submitted to CMS`,
      html: await render(<TempExtStateEmail variables={variables} />),
      text: await render(<TempExtStateEmail variables={variables} />, {
        plainText: true,
      }),
    };
  },
};
