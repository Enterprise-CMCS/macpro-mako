import { Events, Authority, EmailAddresses, CommonEmailVariables } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";

import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  AppKCMSEmail,
  AppKStateEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";
import { Waiver1915bCMSEmail, Waiver1915bStateEmail } from "../widthdrawPackage/emailTemplates";

export const newSubmission: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["NewMedicaidSubmission"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `Medicaid SPA ${variables.id} Submitted`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["NewMedicaidSubmission"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your SPA ${variables.id} has been submitted to CMS`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["NewChipSubmission"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.chipInbox,
        cc: variables.emails.chipCcList,
        subject: `New CHIP SPA ${variables.id} Submitted`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["NewChipSubmission"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your CHIP SPA ${variables.id} has been submitted to CMS`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables:
        | (Events["CapitatedInitial"] & CommonEmailVariables & { emails: EmailAddresses })
        | (Events["ContractingInitial"] & CommonEmailVariables & { emails: EmailAddresses }),
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `${variables.authority} ${variables.id} Submitted`,
        body: await render(<Waiver1915bCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables:
        | (Events["CapitatedInitial"] & CommonEmailVariables & { emails: EmailAddresses })
        | (Events["ContractingInitial"] & CommonEmailVariables & { emails: EmailAddresses }),
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your ${variables.actionType} ${variables.id} has been submitted to CMS`,
        body: await render(<Waiver1915bStateEmail variables={variables} />),
      };
    },
  },

  [Authority["1915c"]]: {
    cms: async (
      variables: Events["NewAppKSubmission"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `1915(c) ${variables.id} Submitted`,
        body: await render(<AppKCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["NewAppKSubmission"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your 1915(c) ${variables.id} has been submitted to CMS`,
        body: await render(<AppKStateEmail variables={variables} />),
      };
    },
  },
};
