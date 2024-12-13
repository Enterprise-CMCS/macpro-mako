import { Action, Authority, CommonEmailVariables, EmailAddresses } from "shared-types";
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

export const withdrawRai: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: any &
        CommonEmailVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.dpoEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        body: await render(<MedSpaCMSEmail relatedEvent={relatedEvent} variables={variables} />),
      };
    },
    state: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);

      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        cc: variables.allStateUsersEmails,
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        body: await render(<MedSpaStateEmail relatedEvent={relatedEvent} variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: any &
        CommonEmailVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);
      return {
        to: variables.emails.chipInbox,
        cc: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        body: await render(<ChipSpaCMSEmail relatedEvent={relatedEvent} variables={variables} />),
      };
    },
    state: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        body: await render(<ChipSpaStateEmail relatedEvent={relatedEvent} variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);
      return {
        to: [
          ...variables.emails.dmcoEmail,
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
        body: await render(
          <Waiver1915bCMSEmail relatedEvent={relatedEvent} variables={variables} />,
        ),
      };
    },
    state: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`], // TODO: change to ALL state users
        cc: variables.allStateUsersEmails,
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        body: await render(
          <Waiver1915bStateEmail relatedEvent={relatedEvent} variables={variables} />,
        ),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      const relatedEvent = await getLatestMatchingEvent(variables.id, Action.RESPOND_TO_RAI);
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.dhcbsooEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
        body: await render(<AppKCMSEmail relatedEvent={relatedEvent} variables={variables} />),
      };
    },
  },
};
