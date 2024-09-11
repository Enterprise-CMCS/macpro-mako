import { DateTime } from "luxon";
import { Action, Authority } from "shared-types";
import { getPackageChangelog } from "../api/package";
import * as EmailContent from "./content";

export type UserType = "cms" | "state";
export interface CommonVariables {
  to: string;
  id: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
}

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

export interface EmailTemplate {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text?: string;
}

type EmailTemplateFunction<T> = (variables: T) => Promise<EmailTemplate>;
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
  const emailTemplatesToSend: EmailTemplateFunction<T>[] = [];
  if (action !== Action.ISSUE_RAI) {
    const template = emailTemplates[action];

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
  }

  return emailTemplatesToSend;
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
