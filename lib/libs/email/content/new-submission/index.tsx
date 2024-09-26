import * as React from "react";
import { Authority, EmailAddresses, OneMac } from "shared-types";
import { CommonVariables, AuthoritiesWithUserTypesTemplate } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
  AppKCMSEmail,
  AppKStateEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";

export const newSubmission: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `Medicaid SPA ${variables.id} Submitted`,
        html: await render(<MedSpaCMSEmail variables={variables} />),
        text: await render(<MedSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Your SPA ${variables.id} has been submitted to CMS`,
        html: await render(<MedSpaStateEmail variables={variables} />),
        text: await render(<MedSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.chipInbox,
        cc: variables.emails.chipCcList,
        subject: `New CHIP SPA ${variables.id} Submitted`,
        html: await render(<ChipSpaCMSEmail variables={variables} />),
        text: await render(<ChipSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Your CHIP SPA ${variables.id} has been submitted to CMS`,
        html: await render(<ChipSpaStateEmail variables={variables} />),
        text: await render(<ChipSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `${variables.authority} ${variables.id} Submitted`,
        html: await render(<Waiver1915bCMSEmail variables={variables} />),
        text: await render(<Waiver1915bCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Your ${variables.actionType} ${variables.id} has been submitted to CMS`,
        html: await render(<Waiver1915bStateEmail variables={variables} />),
        text: await render(<Waiver1915bStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `1915(c) ${variables.id} Submitted`,
        html: await render(<AppKCMSEmail variables={variables} />),
        text: await render(<AppKCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Your 1915(c) ${variables.id} has been submitted to CMS`,
        html: await render(<AppKStateEmail variables={variables} />),
        text: await render(<AppKStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
};
