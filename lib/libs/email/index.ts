import * as dateFns from "date-fns";
import {
  Action,
  Attachment,
  AttachmentKey,
  AttachmentTitle,
  attachmentTitleMap,
  Authority,
} from "shared-types";
import { getPackageChangelog } from "../api/package";
import * as EmailContent from "./content";

export type UserType = "cms" | "state";
export interface CommonVariables {
  to?: string;
  submitterName: string;
  submitterEmail: string;
  id: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
  allStateUsersEmails?: string[];
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
    return dateFns.format(date, "MMMM d, yyyy");
  }
}

export function formatNinetyDaysDate(date: number | null | undefined): string {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return dateFns.format(
      dateFns.add(date, { days: 90 }),
      "MMMM d, yyyy '@ 11:59pm ET'",
    );
  }
}

export interface EmailTemplate {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
}

export type EmailTemplateFunction<T> = (variables: T) => Promise<EmailTemplate>;
export type UserTypeOnlyTemplate = {
  [U in UserType]: EmailTemplateFunction<any>;
};
export type AuthoritiesWithUserTypesTemplate = {
  [A in Authority]?: { [U in UserType]?: EmailTemplateFunction<any> };
};

export type EmailTemplates = {
  [K in Action | "new-submission"]?:
    | AuthoritiesWithUserTypesTemplate
    | UserTypeOnlyTemplate;
};

export const emailTemplates: EmailTemplates = {
  "new-submission": EmailContent.newSubmission,

  /* 
    {
      "medicaid spa": {
        "cms": "func",
        "state": "func"
      },
      "chip spa": {
        "cms": "func",
        "state": "func"
      },
      "1915(b)": {
        "cms": "func",
        "state": "func"
      },
      "1915(c)": {
        "cms": "func",
        "state": "func"
      }
    }
  */

  [Action.WITHDRAW_PACKAGE]: EmailContent.withdrawPackage,

  /* 
    {
      "medicaid spa": {
        "cms": "func",
        "state": "func"
      },
      "chip spa": {
        "cms": "func",
        "state": "func"
      },
      "1915(b)": {
        "cms": "func",
        "state": "func"
      }
    }
  */

  [Action.RESPOND_TO_RAI]: EmailContent.respondToRai,

  /* 
    {
      "medicaid spa": {
        "cms": "func",
        "state": "func"
      },
      "chip spa": {
        "cms": "func",
        "state": "func"
      },
      "1915(b)": {
        "cms": "func",
        "state": "func"
      }
        MISSING? :
      "1915(b)": {
        "cms": "func",
        "state": "func"
      }
    }
  */

  [Action.WITHDRAW_RAI]: EmailContent.withdrawRai,

  /* 
    {
      "medicaid spa": {
        "cms": "func",
        "state": "func"
      },
      "chip spa": {
        "cms": "func",
        "state": "func"
      },
      "1915(b)": {
        "cms": "func",
        "state": "func"
      },
      "1915(c)": {
        "cms": "func"
      }
    }
  */

  [Action.TEMP_EXTENSION]: EmailContent.tempExtention,
  /* 
    {
      "cms": "func",
      "state": "func"
    } 
  */
};

function isAuthorityTemplate(
  obj: any,
  authority: Authority,
): obj is AuthoritiesWithUserTypesTemplate {
  return authority in obj;
}

export async function getEmailTemplates<T>(
  action: Action | "new-submission",
  authority: Authority,
): Promise<EmailTemplateFunction<T>[]> {
  const template = emailTemplates[action];
  console.log("template", template);
  const emailTemplatesToSend: EmailTemplateFunction<T>[] = [];
  console.log("emailTemplatesToSend", emailTemplatesToSend);
  if (!template) {
    throw new Error(`No templates found for action ${action}`);
  }

  if (isAuthorityTemplate(template, authority)) {
    emailTemplatesToSend.push(
      ...Object.values(template[authority] as EmailTemplateFunction<T>),
    );
  } else {
    emailTemplatesToSend.push(...Object.values(template));
  }
  console.log("emailTemplatesToSend", emailTemplatesToSend);
  return emailTemplatesToSend;
}

// I think this needs to be written to handle not finding any matching events and so forth
export async function getLatestMatchingEvent(id: string, actionType: string) {
  const item = await getPackageChangelog(id);
  console.log("item", item);
  const events = item.hits.hits.filter(
    (hit: any) => hit._source.actionType === actionType,
  );
  console.log("events", events);
  events.sort((a: any, b: any) => b._source.timestamp - a._source.timestamp);
  const latestMatchingEvent = events[0]._source;
  return latestMatchingEvent;
}

export * from "./getAllStateUsers";
