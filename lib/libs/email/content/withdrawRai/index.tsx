import { CommonEmailVariables, EmailAddresses, Events, Authority } from "shared-types";
import { AuthoritiesWithUserTypesTemplate, getLatestMatchingEvent } from "../..";

import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
  AppKCMSEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";

const getWithdrawRaiEvent = async (id: string): Promise<Events["WithdrawRai"] | null> => {
  const event = await getLatestMatchingEvent(id);
  return event as unknown as Events["WithdrawRai"] | null;
};

export const withdrawRai: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.dpoEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        body: await render(
          <MedSpaCMSEmail variables={variables as any} relatedEvent={relatedEvent as any} />,
        ),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        cc: variables.allStateUsersEmails,
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        body: await render(
          <MedSpaStateEmail variables={variables as any} relatedEvent={relatedEvent as any} />,
        ),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["WithdrawRai"] &
        CommonEmailVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: variables.emails.chipInbox,
        cc: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        body: await render(
          <ChipSpaCMSEmail relatedEvent={relatedEvent as any} variables={variables} />,
        ),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        body: await render(
          <ChipSpaStateEmail relatedEvent={relatedEvent as any} variables={variables as any} />,
        ),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["WithdrawRai"] &
        CommonEmailVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: [
          ...variables.emails.dmcoEmail,
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
        body: await render(
          <Waiver1915bCMSEmail relatedEvent={relatedEvent as any} variables={variables as any} />,
        ),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`], // TODO: change to ALL state users
        cc: variables.allStateUsersEmails,
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        body: await render(
          <Waiver1915bStateEmail relatedEvent={relatedEvent as any} variables={variables as any} />,
        ),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const relatedEvent = await getWithdrawRaiEvent(variables.id);
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.dhcbsooEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
        body: await render(
          <AppKCMSEmail variables={variables as any} relatedEvent={relatedEvent as any} />,
        ),
      };
    },
  },
};
