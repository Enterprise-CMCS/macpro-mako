import { CommonEmailVariables, EmailAddresses, Events, Authority } from "shared-types";
import { AuthoritiesWithUserTypesTemplate, getLatestMatchingEvent } from "../..";
import { Waiver1915bCMSEmail, Waiver1915bStateEmail, AppKCMSEmail } from "./emailTemplates";
import { render } from "@react-email/render";
import { EmailProcessingError } from "libs/email/errors";

const getWithdrawRaiEvent = async (id: string) => {
  const event = await getLatestMatchingEvent(id, "withdraw-rai");

  if (!event) {
    return null;
  }

  return event;
};

export const withdrawRai: AuthoritiesWithUserTypesTemplate = {
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      try {
        const relatedEvent = (await getLatestMatchingEvent(
          variables.id,
          "respond-to-rai",
        )) as unknown as Events["RespondToRai"];
        if (!relatedEvent) {
          throw new EmailProcessingError(
            `Failed to find original RAI response event for withdrawal (ID: ${variables.id})`,
            {
              id: variables.id,
              actionType: "RespondToRai",
              emailType: "withdrawRai",
              severity: "ERROR",
            },
          );
        }
        return {
          to: [
            ...variables.emails.dmcoEmail,
            ...variables.emails.osgEmail,
            ...variables.emails.cpocEmail,
            ...variables.emails.srtEmails,
          ],
          subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
          body: await render(
            <Waiver1915bCMSEmail relatedEvent={relatedEvent} variables={variables} />,
          ),
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      try {
        const relatedEvent = (await getLatestMatchingEvent(
          variables.id,
          "respond-to-rai",
        )) as unknown as Events["RespondToRai"];
        if (!relatedEvent) {
          throw new EmailProcessingError(
            `Failed to find original RAI response event for withdrawal (ID: ${variables.id})`,
            {
              id: variables.id,
              actionType: "RespondToRai",
              emailType: "withdrawRai",
              severity: "ERROR",
            },
          );
        }
        return {
          to: variables.allStateUsersEmails || [],
          subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
          body: await render(
            <Waiver1915bStateEmail relatedEvent={relatedEvent} variables={variables} />,
          ),
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      try {
        const relatedEvent = (await getLatestMatchingEvent(
          variables.id,
          "respond-to-rai",
        )) as unknown as Events["RespondToRai"];
        if (!relatedEvent) {
          throw new EmailProcessingError(
            `Failed to find original RAI response event for withdrawal (ID: ${variables.id})`,
            {
              id: variables.id,
              actionType: "RespondToRai",
              emailType: "withdrawRai",
              severity: "ERROR",
            },
          );
        }
        return {
          to: [
            ...variables.emails.osgEmail,
            ...variables.emails.dhcbsooEmail,
            ...variables.emails.cpocEmail,
            ...variables.emails.srtEmails,
          ],
          subject: `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`,
          body: await render(<AppKCMSEmail variables={variables} relatedEvent={relatedEvent} />),
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      try {
        const relatedEvent = await getWithdrawRaiEvent(variables.id);
        if (!relatedEvent) {
          throw new EmailProcessingError(
            `Failed to find original RAI response event for withdrawal (ID: ${variables.id})`,
            {
              id: variables.id,
              actionType: "RespondToRai",
              emailType: "withdrawRai",
              severity: "ERROR",
            },
          );
        }
        return {
          to: variables.allStateUsersEmails || [],
          subject: `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`,
          body: await render(
            <AppKCMSEmail variables={variables} relatedEvent={relatedEvent as any} />,
          ),
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
