import { DateTime } from "luxon";
import {
  Action,
  Attachment,
  AttachmentKey,
  AttachmentTitle,
  attachmentTitleMap,
  Authority,
  RaiResponse,
  RaiWithdraw,
} from "shared-types";
import { OneMac, WithdrawPackage } from "shared-types";
import { getPackageChangelog } from "../api/package";
import { Email } from "../../stacks";
import * as EmailContent from "./content";

export type UserType = "cms" | "state";

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export type EmailTemplateFunction<T> = (variables: T) => Promise<EmailTemplate>;

export type EmailTemplates = {
  [K in Action | "new-submission"]?:
    | {
        [A in Authority]?:
          | {
              [U in UserType]?: EmailTemplateFunction<any>;
            }
          | EmailTemplateFunction<any>;
      }
    | {
        [U in UserType]?: EmailTemplateFunction<any>;
      }
    | EmailTemplateFunction<any>;
};

export interface CommonVariables {
  id: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
}

export const formatAttachments = (
  formatType: "text" | "html",
  attachmentList?: Attachment[] | null,
): string => {
  const formatChoices = {
    text: {
      begin: "\n\n",
      joiner: "\n",
      end: "\n\n",
    },
    html: {
      begin: "<ul><li>",
      joiner: "</li><li>",
      end: "</li></ul>",
    },
  };
  const format = formatChoices[formatType];
  if (!format) {
    console.log("new format type? ", formatType);
    return "attachment List";
  }
  if (!attachmentList || attachmentList.length === 0) return "no attachments";
  else {
    const attachmentFormat = attachmentList.map((a) => {
      const attachmentTitle: AttachmentTitle =
        a.title in attachmentTitleMap
          ? attachmentTitleMap[a.title as AttachmentKey]
          : a.title;
      return `${attachmentTitle}: ${a.filename}`;
    });
    return `${format.begin}${attachmentFormat.join(format.joiner)}${
      format.end
    }`;
  }
};

export function formatDate(date: number | null | undefined) {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return DateTime.fromMillis(date).toFormat("DDDD");
  }
}

export function formatNinetyDaysDate(date: number | null | undefined): string {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return DateTime.fromMillis(date)
      .plus({ days: 90 })
      .toFormat("DDDD '@ 11:59pm ET'");
  }
}

export const emailTemplates: EmailTemplates = {
  "new-submission": EmailContent.newSubmission,
  [Action.WITHDRAW_PACKAGE]: EmailContent.withdrawPackage,
  [Action.RESPOND_TO_RAI]: EmailContent.respondToRai,
  [Action.WITHDRAW_RAI]: EmailContent.withdrawRai,
  [Action.TEMP_EXTENSION]: EmailContent.tempExtention,
};

export async function getEmailTemplate<T>(
  action: Action | "new-submission",
  authority: Authority,
  userType: "cms" | "state",
): Promise<EmailTemplateFunction<T>> {
  const template = emailTemplates[action];

  if (!template) {
    throw new Error(`No templates found for action ${action}`);
  }

  if (typeof template === "function") {
    return template as EmailTemplateFunction<T>;
  } else {
    if (userType in template) {
      return (template as { [key in UserType]: EmailTemplateFunction<any> })[
        userType
      ] as EmailTemplateFunction<T>;
    }

    if (!authority) {
      throw new Error(`Authority is required for action ${action}`);
    }

    const authorityTemplate = (
      template as {
        [key in Authority]?: { [key in UserType]?: EmailTemplateFunction<any> };
      }
    )[authority];

    if (!authorityTemplate) {
      throw new Error(
        `No templates found for authority ${authority} and action ${action}`,
      );
    }

    if (typeof authorityTemplate === "function") {
      return authorityTemplate as EmailTemplateFunction<T>;
    } else {
      const userTemplate = (
        authorityTemplate as {
          [key in UserType]?: EmailTemplateFunction<any>;
        }
      )[userType];

      if (!userTemplate) {
        throw new Error(
          `No templates found for user type ${userType}, authority ${authority}, and action ${action}`,
        );
      }

      return userTemplate as EmailTemplateFunction<T>;
    }
  }
}

// I think this needs to be written to handle not finding any matching events and so forth
export async function getLatestMatchingEvent(id: string, actionType: string) {
  const item = await getPackageChangelog(id);
  const events = item.hits.hits.filter(
    (hit) => hit._source.actionType === actionType,
  );
  events.sort((a, b) => b._source.timestamp - a._source.timestamp);
  const latestMatchingEvent = events[0]._source;
  return latestMatchingEvent;
}
