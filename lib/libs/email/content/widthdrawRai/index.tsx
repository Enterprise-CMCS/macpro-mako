import * as React from "react";
import { Action, Authority, EmailAddresses, RaiWithdraw } from "shared-types";
import { CommonVariables, getLatestMatchingEvent } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
  AppKCMSEmail,
} from "./emailTemplate";
import { render } from "@react-email/components";

export const withdrawRai = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: RaiWithdraw &
        CommonVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: `${variables.emails.osgEmail};${variables.emails.dpoEmail}`, // TODO Should also include CPOC and SRT
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        html: render(
          <MedSpaCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          {
            pretty: true,
          },
        ),
        text: render(
          <MedSpaCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          {
            plainText: true,
          },
        ),
      };
    },
    state: async (
      variables: RaiWithdraw &
        CommonVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`, // TODO: should go to all state users, but we dont have that info
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        html: render(
          <MedSpaStateEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            pretty: true,
          },
        ),
        text: render(
          <MedSpaStateEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            plainText: true,
          },
        ),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: RaiWithdraw &
        CommonVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: variables.emails.chipInbox,
        cc: variables.emails.chipCcList, // TODO: Should also go to CPOC and SRT
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        html: render(
          <ChipSpaCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          {
            pretty: true,
          },
        ),
        text: render(
          <ChipSpaCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          {
            plainText: true,
          },
        ),
      };
    },
    state: async (
      variables: RaiWithdraw & CommonVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`,
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        html: render(
          <ChipSpaStateEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            pretty: true,
          },
        ),
        text: render(
          <ChipSpaStateEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            plainText: true,
          },
        ),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: RaiWithdraw & CommonVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: `${variables.emails.dmcoEmail};${variables.emails.osgEmail}`, // TODO: add CPOC and SRT
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
        html: render(
          <Waiver1915bCMSEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            pretty: true,
          },
        ),
        text: render(
          <Waiver1915bCMSEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            plainText: true,
          },
        ),
      };
    },
    state: async (
      variables: RaiWithdraw & CommonVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>`, // TODO: "All State Users"
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        html: render(
          <Waiver1915bStateEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            pretty: true,
          },
        ),
        text: render(
          <Waiver1915bStateEmail
            relatedEvent={relatedEvent}
            variables={variables}
          />,
          {
            plainText: true,
          },
        ),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: RaiWithdraw & CommonVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(
        variables.id,
        Action.RESPOND_TO_RAI,
      );
      return {
        to: `${variables.emails.osgEmail};${variables.emails.dhcbsooEmail}`, // TODO: also should go to CPOC and SRT
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
        html: render(
          <AppKCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          {
            pretty: true,
          },
        ),
        text: render(
          <AppKCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          {
            plainText: true,
          },
        ),
      };
    },
  },
};
