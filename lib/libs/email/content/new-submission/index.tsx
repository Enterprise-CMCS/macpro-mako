import * as React from "react";
import { Authority, EmailAddresses, OneMac } from "shared-types";
import { CommonVariables } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
  AppKCMSEmail,
  AppKStateEmail,
} from "./emailTemplate";
import { render } from "@react-email/components";

export const newSubmission = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: OneMac &
        CommonVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `Medicaid SPA ${variables.id} Submitted`,
        html: render(<MedSpaCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<MedSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`,
        subject: `Your SPA ${variables.id} has been submitted to CMS`,
        html: render(<MedSpaStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<MedSpaStateEmail variables={variables} />, {
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
        html: render(<ChipSpaCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<ChipSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`,
        subject: `Your CHIP SPA ${variables.id} has been submitted to CMS`,
        html: render(<ChipSpaStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<ChipSpaStateEmail variables={variables} />, {
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
        html: render(<Waiver1915bCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<Waiver1915bCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`,
        subject: `Your ${variables.actionType} ${variables.id} has been submitted to CMS`,
        html: render(<Waiver1915bStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<Waiver1915bStateEmail variables={variables} />, {
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
        html: render(<AppKCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<AppKCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: OneMac & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`,
        subject: `Your 1915(c) ${variables.id} has been submitted to CMS`,
        html: render(<AppKStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<AppKStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
};
