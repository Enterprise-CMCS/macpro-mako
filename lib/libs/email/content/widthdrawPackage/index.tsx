import * as React from "react";
import { Authority, EmailAddresses, WithdrawPackage } from "shared-types";
import { CommonEmailVariables, AuthoritiesWithUserTypesTemplate } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";

export const withdrawPackage: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: WithdrawPackage &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        cc: variables.emails.dpoEmail,
        subject: `SPA Package ${variables.id} Withdraw Request`,
        html: await render(<MedSpaCMSEmail variables={variables} />),
        text: await render(<MedSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: WithdrawPackage &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Medicaid SPA Package ${variables.id} Withdrawal Confirmation`,
        html: await render(<MedSpaStateEmail variables={variables} />),
        text: await render(<MedSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: WithdrawPackage &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA Package ${variables.id} Withdraw Request`,
        html: await render(<ChipSpaCMSEmail variables={variables} />),
        text: await render(<ChipSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },

    // The confluence page shows this email should not be sent: https://qmacbis.atlassian.net/wiki/spaces/MACPRO/pages/3286138882/Email+Notifications+for+Package+Actions#State-Users.3
    //     state: async (
    //       variables: WithdrawPackage & CommonEmailVariables & { emails: EmailAddresses },
    //     ) => {
    //       return {
    //         to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
    //         subject: `CHIP SPA Package ${variables.id} Withdrawal Confirmation`,
    //         html: await render(<ChipSpaCMSEmail variables={variables} />, {
    //
    //        }),
    //         text: await render(<ChipSpaCMSEmail variables={variables} />, {
    //         plainText: true,
    //        }),
    //       };
    //     },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: WithdrawPackage &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `Waiver Package ${variables.id} Withdraw Request`,
        html: await render(<Waiver1915bCMSEmail variables={variables} />),
        text: await render(<Waiver1915bCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: WithdrawPackage &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `1915(b) Waiver ${variables.id} Withdrawal Confirmation`,
        html: await render(<Waiver1915bStateEmail variables={variables} />),
        text: await render(<Waiver1915bStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
};
