import { Authority, EmailAddresses, Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import { render } from "@react-email/render";
import { TempExtCMSEmail, TempExtStateEmail } from "./emailTemplates";

export const tempExtension: AuthoritiesWithUserTypesTemplate = {
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["TemporaryExtension"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `${variables.authority} Waiver Extension ${variables.id} Submitted`,
        body: await render(<TempExtCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["TemporaryExtension"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your Request for the ${variables.authority} Waiver Extension ${variables.id} has been submitted to CMS`,
        body: await render(<TempExtStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: Events["TemporaryExtension"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `${variables.authority} Waiver Extension ${variables.id} Submitted`,
        body: await render(<TempExtCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["TemporaryExtension"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your Request for the ${variables.authority} Waiver Extension ${variables.id} has been submitted to CMS`,
        body: await render(<TempExtStateEmail variables={variables} />),
      };
    },
  },
};
