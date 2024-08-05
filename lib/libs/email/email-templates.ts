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

type UserType = "cms" | "state";

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

type EmailTemplateFunction<T> = (variables: T) => Promise<EmailTemplate>;

type EmailTemplates = {
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

interface CommonVariables {
  id: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
}

const formatAttachments = (
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

function formatDate(date: number | null | undefined) {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return DateTime.fromMillis(date).toFormat("DDDD");
  }
}

function formatNinetyDaysDate(date: number | null | undefined): string {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return DateTime.fromMillis(date)
      .plus({ days: 90 })
      .toFormat("DDDD '@ 11:59pm ET'");
  }
}

export const emailTemplates: EmailTemplates = {
  "new-submission": {
    [Authority.MED_SPA]: {
      cms: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `Medicaid SPA ${variables.id} Submitted`,
          html: `
<p>The OneMAC Submission Portal received a Medicaid SPA Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='${variables.applicationEndpointUrl}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email:</b> ${variables.submitterEmail}
<br><b>Medicaid SPA ID: ${variables.id}</b>
<br><b>Proposed Effective Date:</b> ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}
</p>
<b>Summary:</b>
<br>${variables.additionalInformation}
<br>
<br><b>Files:</b>
<br>${formatAttachments("html", variables.attachments)}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a Medicaid SPA Submission:

The submission can be accessed in the OneMAC application, which you can 
find at ${variables.applicationEndpointUrl}.

If you are not already logged in, please click the "Login" link at the top 
of the page and log in using your Enterprise User Administration (EUA) 
credentials.

After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
Medicaid SPA ID: ${variables.id}
Proposed Effective Date: ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `Your SPA ${variables.id} has been submitted to CMS`,
          html: `
<p>This response confirms that you submitted a Medicaid SPA to CMS for review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Medicaid SPA ID: ${variables.id}</b>
<br><b>Proposed Effective Date:</b> ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}
<br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}
</p>
<b>Summary:</b>
<br>${variables.additionalInformation}
<br>
<p>This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}.</p>
<p>This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
This response confirms that you submitted a Medicaid SPA to CMS for review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Medicaid SPA ID: ${variables.id}
Proposed Effective Date:  ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}
90th Day Deadline: ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}

Summary:
${variables.additionalInformation}

This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before ${formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.

This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.

If you have questions or did not expect this email, please contact 
spa@cms.hhs.gov.

Thank you!`,
        };
      },
    },
    [Authority.CHIP_SPA]: {
      cms: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `New CHIP SPA ${variables.id} Submitted`,
          html: `
<p>The OneMAC Submission Portal received a CHIP State Plan Amendment:</p>
<ul>
<li>The submission can be accessed in the OneMAC Micro application, which 
you can find at <a href='${variables.applicationEndpointUrl}'>
${variables.applicationEndpointUrl}</a>.</li>
<li>If you are not already logged in, please click the "Login" link at the 
top of the page and log in using your Enterprise User Administration (EUA) 
credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC Micro 
application. The submission will be listed on the dashboard page, and you 
can view its details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email:</b> ${variables.submitterEmail}
<br><b>CHIP SPA Package ID:</b> ${variables.id}
</p><br/>
Summary:
<br>${variables.additionalInformation}
<br>
<p>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<br></p>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a CHIP State Plan Amendment:

- The submission can be accessed in the OneMAC Micro application, which you can 
  find at ${variables.applicationEndpointUrl}.
- If you are not already logged in, please click the "Login" link at the 
  top of the page and log in using your Enterprise User Administration (EUA) 
  credentials.
- After you have logged in, you will be taken to the OneMAC Micro 
  application. The submission will be listed on the dashboard page, and you 
  can view its details by clicking on its ID number.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
CHIP SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("html", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `Your CHIP SPA ${variables.id} has been submitted to CMS`,
          html: `
    <p>This is confirmation that you submitted a CHIP State Plan Amendment 
    to CMS for review:</p>
    <p>
    <br><b>State or territory:</b> ${variables.territory}
    <br><b>Name:</b> ${variables.submitterName}
    <br><b>Email Address:</b> ${variables.submitterEmail}
    <br><b>CHIP SPA Package ID:</b> ${variables.id}
    </p>
    Summary:
    <br>${variables.additionalInformation}
    <br>
    <p>This response confirms the receipt of your CHIP State Plan Amendment 
    (CHIP SPA). You can expect a formal response to your submittal from CMS 
    at a later date.
    </p>
    <p>If you have questions or did not expect this email, please contact 
    <a href='mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov'>CHIPSPASubmissionMailBox@CMS.HHS.gov</a> or your state lead.</p>
    <p>Thank you!</p>`,
          text: `
    This is confirmation that you submitted a CHIP State Plan Amendment 
    to CMS for review:
    
    State or territory: ${variables.territory}
    Name: ${variables.submitterName}
    Email Address: ${variables.submitterEmail}
    CHIP SPA Package ID: ${variables.id}
    
    Summary:
    ${variables.additionalInformation}
    
    This response confirms the receipt of your CHIP State Plan Amendment 
    (CHIP SPA). You can expect a formal response to your submittal from CMS 
    at a later date.
    
    If you have questions or did not expect this email, please contact 
    CHIPSPASubmissionMailBox@CMS.HHS.gov.
    
    Thank you!`,
        };
      },
    },
    [Authority["1915b"]]: {
      cms: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `${variables.authority} ${variables.id} Submitted`,
          html: `
    <p>The OneMAC Submission Portal received a 1915(b) ${
      variables.actionType
    } Submission:</p>
    <ul>
    <li>The submission can be accessed in the OneMAC application, which you 
    can find at <a href='${
      variables.applicationEndpointUrl
    }'>this link</a>.</li>
    <li>If you are not already logged in, please click the "Login" link 
    at the top of the page and log in using your Enterprise User 
    Administration (EUA) credentials.</li>
    <li>After you have logged in, you will be taken to the OneMAC application. 
    The submission will be listed on the dashboard page, and you can view its 
    details by clicking on its ID number.</li>
    </ul>
    <p>
    <br><b>State or territory:</b> ${variables.territory}
    <br><b>Name:</b> ${variables.submitterName}
    <br><b>Email Address:</b> ${variables.submitterEmail}
    <br><b>${variables.actionType} Number:</b> ${variables.id}
    <br><br><b>Waiver Authority:</b> ${variables.authority}
    <br><b>Proposed Effective Date:</b> ${DateTime.fromMillis(
      variables.notificationMetadata?.proposedEffectiveDate!,
    ).toFormat("DDDD")}
    </p>
    <b>Summary:</b>
    <br>${variables.additionalInformation}
    <br>
    <br><b>Files:</b>
    <br>${formatAttachments("html", variables.attachments)}
    <br>
    <p>If the contents of this email seem suspicious, do not open them, and instead 
    forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
    <p>Thank you!</p>`,
          text: `
    The OneMAC Submission Portal received a 1915(b) ${
      variables.actionType
    } submission:
    
    The submission can be accessed in the OneMAC application, which you 
    can find at ${variables.applicationEndpointUrl}.
    
    If you are not already logged in, please click the "Login" link
    at the top of the page and log in using your Enterprise User 
    Administration (EUA) credentials.
    
    After you have logged in, you will be taken to the OneMAC application.
    The submission will be listed on the dashboard page, and you can view its 
    details by clicking on its ID number.
    
    
    State or territory: ${variables.territory}
    Name: ${variables.submitterName}
    Email: ${variables.submitterEmail}
    ${variables.actionType} Number: ${variables.id}
    
    Waiver Authority: ${variables.authority}
    Proposed Effective Date: ${DateTime.fromMillis(
      variables.notificationMetadata?.proposedEffectiveDate!,
    ).toFormat("DDDD")}
    
    Summary:
    ${variables.additionalInformation}
    
    Files:
    ${formatAttachments("html", variables.attachments)}
    
    If the contents of this email seem suspicious, do not open them, and instead 
    forward this email to SPAM@cms.hhs.gov.
    
    Thank you!`,
        };
      },
      state: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `Your ${variables.actionType} ${variables.id} has been submitted to CMS`,
          html: `
    <p>This response confirms the submission of your 1915(b) ${
      variables.actionType
    } to CMS for review:</p>
    <p>
    <br><b>State or territory:</b> ${variables.territory}
    <br><b>Name:</b> ${variables.submitterName}
    <br><b>Email Address:</b> ${variables.submitterEmail}
    <br><b>${variables.actionType} Number:</b> ${variables.id}</b>
    <br><b>Waiver Authority:</b> ${variables.authority}
    <br><b>Proposed Effective Date:</b> ${DateTime.fromMillis(
      variables.notificationMetadata?.proposedEffectiveDate!,
    ).toFormat("DDDD")}
    <br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(
      variables.notificationMetadata?.submissionDate,
    )}
    </p>
    <b>Summary:</b>
    <br>${variables.additionalInformation}
    <br>
    <p>This response confirms the receipt of your Waiver request or your response
    to a Waiver Request for Additional Information (RAI). You can expect a formal
    response to your submittal to be issued within 90 days,
    before ${formatNinetyDaysDate(
      variables.notificationMetadata?.submissionDate,
    )}.</p>
    <p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
    responses to Requests for Additional Information (RAI) on Waivers,
    and extension requests on Waivers only. Any other correspondence will be disregarded</p>
    <p>If you have questions or did not expect this email, please contact 
    <a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
    <p>Thank you!</p>`,
          text: `
    This response confirms the submission of your 1915(b) ${
      variables.actionType
    } to CMS for review:
    
    State or territory: ${variables.territory}
    Name: ${variables.submitterName}
    Email Address: ${variables.submitterEmail}
    ${variables.actionType} Number: ${variables.id}
    Waiver Authority: ${variables.authority}
    Proposed Effective Date: ${DateTime.fromMillis(
      variables.notificationMetadata?.proposedEffectiveDate!,
    ).toFormat("DDDD")}
    90th Day Deadline: ${formatNinetyDaysDate(
      variables.notificationMetadata?.submissionDate,
    )}
    
    Summary:
    ${variables.additionalInformation}
    
    This response confirms the receipt of your Waiver request or your response
    to a Waiver Request for Additional Information (RAI). You can expect a formal
    response to your submittal to be issued within 90 days,
    before ${formatNinetyDaysDate(
      variables.notificationMetadata?.submissionDate,
    )}.
    
    This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
    responses to Requests for Additional Information (RAI) on Waivers,
    and extension requests on Waivers only. Any other correspondence will be disregarded
    
    If you have questions or did not expect this email, please contact
    spa@cms.hhs.gov or your state lead.
    
    Thank you!`,
        };
      },
    },
    [Authority["1915c"]]: {
      cms: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `1915(c) ${variables.id} Submitted`,
          html: `
<p>The OneMAC Submission Portal received a 1915(c) Appendix K Amendment Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='${variables.applicationEndpointUrl}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Amendment Title:</b> ${variables.appkTitle}
<br><b>Waiver Amendment Number:</b> ${variables.id}
<br><b>Waiver Authority:</b> 1915(c)
<br><b>Proposed Effective Date: ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}
</p>
Summary:
<br>${variables.additionalInformation}
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
This response confirms the submission of your [insert Waiver Action] to CMS for review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Amendment Title: ${variables.appkTitle}
Waiver Amendment Number: ${variables.id}
Waiver Authority: 1915(c)
Proposed Effective Date: ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("html", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@CMS.HHS.gov

Thank you!
`,
        };
      },
      state: async (variables: OneMac & CommonVariables) => {
        return {
          subject: `Your 1915(c) ${variables.id} has been submitted to CMS`,
          html: `
<p>This response confirms the submission of your 1915(c) Waiver to CMS for review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Initial Waiver Number:</b> ${variables.id}
<br><b>Waiver Authority:</b> 1915(c)
<br><b>Proposed Effective Date:</b> ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}
<br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}
</p>
Summary:
<br>${variables.additionalInformation}
<p>
This response confirms the receipt of your Waiver request or your response
to a Waiver Request for Additional Information (RAI). You can expect a formal
response to your submittal to be issued within 90 days, before ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}.
</p>
<p>
This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers, and
extension requests on Waivers only.  Any other correspondence will be disregarded.
</p>
<p>If you have questions, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
          text: `
This response confirms the submission of your 1915(c) Waiver to CMS for review:

State or territory:${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Initial Waiver Number: ${variables.id}
Waiver Authority: 1915(c)
Proposed Effective Date: ${formatDate(
            variables.notificationMetadata?.proposedEffectiveDate!,
          )}
90th Day Deadline: ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}

Summary:
${variables.additionalInformation}

This response confirms the receipt of your Waiver request or your response
to a Waiver Request for Additional Information (RAI). You can expect a formal
response to your submittal to be issued within 90 days, before ${formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          )}.

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers, and
extension requests on Waivers only.  Any other correspondence will be disregarded.

If you have questions, please contact SPA@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
  },
  [Action.WITHDRAW_PACKAGE]: {
    [Authority.MED_SPA]: {
      cms: async (variables: WithdrawPackage & CommonVariables) => {
        return {
          subject: `SPA Package ${variables.id} Withdraw Request`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the package below. 
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email:</b> ${variables.submitterEmail}
<br><b>Medicaid SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the package below. 
The package will no longer be considered for CMS review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
Medicaid SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: WithdrawPackage & CommonVariables) => {
        return {
          subject: `Medicaid SPA Package ${variables.id} Withdrawal Confirmation`,
          html: `
    <p>This email is to confirm Medicaid SPA ${variables.id} was withdrawn
    by ${variables.submitterName}. The review of Medicaid SPA ${variables.id} has concluded.</p>
    <p>If you have questions or did not expect this email, please contact 
    <a href='mailto:SPA@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
    <p>Thank you!</p>`,
          text: `
    This email is to confirm Medicaid SPA ${variables.id} was withdrawn
    by ${variables.submitterName}. The review of Medicaid SPA ${variables.id} has concluded.</p>
    If you have questions or did not expect this email, please contact 
    SPA@cms.hhs.gov or your state lead.
    Thank you!`,
        };
      },
    },
    [Authority.CHIP_SPA]: {
      cms: async (variables: WithdrawPackage & CommonVariables) => {
        return {
          subject: `CHIP SPA Package ${variables.id} Withdraw Request`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>CHIP SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead forward this email to 
<a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>
</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
CHIP SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@cms.hhs.gov'

Thank you!`,
        };
      },
      state: async (variables: WithdrawPackage & CommonVariables) => {
        return {
          subject: `CHIP SPA Package ${variables.id} Withdrawal Confirmation`,
          html: `
<p>This email is to confirm CHIP SPA ${variables.id} was withdrawn
by ${variables.submitterName}. The review of CHIP SPA ${variables.id} has concluded.</p>
<p>If you have any questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
          text: `
This email is to confirm CHIP SPA ${variables.id} was withdrawn
by ${variables.submitterName}. The review of CHIP SPA ${variables.id} has concluded.

If you have any questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
    [Authority["1915b"]]: {
      cms: async (variables: WithdrawPackage & CommonVariables) => {
        return {
          subject: `Waiver Package ${variables.id} Withdraw Request`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email:</b> ${variables.submitterEmail}
<br><b>Waiver Number:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
he OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
${variables.actionType} Number: ${variables.id}

Summary:
${variables.additionalInformation}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: WithdrawPackage & CommonVariables) => {
        return {
          subject: `1915(b) Waiver ${variables.id} Withdrawal Confirmation`,
          html: `
<p>This email is to confirm 1915(b) Waiver ${variables.id} was withdrawn
by ${variables.submitterName}. The review of 1915(b) Waiver ${variables.id} has concluded.</p>
<p>If you have questions, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
          text: `
This email is to confirm 1915(b) Waiver ${variables.id} was withdrawn by ${variables.submitterName}.
The review of 1915(b) Waiver ${variables.id} has concluded.

If you have questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
  },
  [Action.RESPOND_TO_RAI]: {
    [Authority.MED_SPA]: {
      cms: async (variables: RaiResponse & CommonVariables) => {
        return {
          subject: `Medicaid SPA RAI Response for ${variables.id} Submitted`,
          html: `
<p>The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='${variables.applicationEndpointUrl}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email:</b> ${variables.submitterEmail}
<br><b>Medicaid SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:

The submission can be accessed in the OneMAC application, which you can 
find at ${variables.applicationEndpointUrl}.

If you are not already logged in, please click the "Login" link at the top 
of the page and log in using your Enterprise User Administration (EUA) 
credentials.

After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
Medicaid SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: RaiResponse & CommonVariables) => {
        return {
          subject: `Your Medicaid SPA RAI Response for ${variables.id} has been submitted to CMS`,
          html: `
<p>This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Medicaid SPA ID:</b> ${variables.id}
<br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(variables.responseDate)}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>This response confirms receipt of your Medicaid State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before ${formatNinetyDaysDate(variables.responseDate)}.</p>
<p>This mailbox is for the submittal of State Plan Amendments and non-web based responses to
 Requests for Additional Information (RAI) on submitted SPAs only. 
 Any other correspondence will be disregarded.</p>
<p>If you have questions, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
          text: `
This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Medicaid SPA ID: ${variables.id}
90th Day Deadline: ${formatNinetyDaysDate(variables.responseDate)}

Summary:
${variables.additionalInformation}

This response confirms receipt of your Medicaid State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before ${formatNinetyDaysDate(variables.responseDate)}.

This mailbox is for the submittal of State Plan Amendments and non-web 
based responses to Requests for Additional Information (RAI) on submitted 
SPAs only. Any other correspondence will be disregarded.

If you have questions, please contact SPA@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
    [Authority.CHIP_SPA]: {
      cms: async (variables: RaiResponse & CommonVariables) => {
        return {
          subject: `CHIP SPA RAI Response for ${variables.id} Submitted`,
          html: `
<p>The OneMAC Submission Portal received a CHIP SPA RAI Response Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='${variables.applicationEndpointUrl}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>CHIP SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a CHIP SPA RAI Response Submission:

- The submission can be accessed in the OneMAC application, which you can 
  find at ${variables.applicationEndpointUrl}.
- If you are not already logged in, please click the "Login" link at the top 
  of the page and log in using your Enterprise User Administration (EUA) 
  credentials.
- After you have logged in, you will be taken to the OneMAC application. 
  The submission will be listed on the dashboard page, and you can view its 
  details by clicking on its ID number.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
CHIP SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: RaiResponse & CommonVariables) => {
        return {
          subject: `Your CHIP SPA RAI Response for ${variables.id} has been submitted to CMS`,
          html: `
<p>This response confirms you submitted a CHIP SPA RAI Response to CMS for review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>CHIP SPA Package ID:</b> ${variables.id}
<br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(variables.responseDate)}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>This response confirms receipt of your CHIP State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before ${formatNinetyDaysDate(variables.responseDate)}.</p>
<p>If you have questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
          text: `
This response confirms you submitted a CHIP SPA RAI Response to CMS for review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
CHIP SPA Package ID: ${variables.id}
90th Day Deadline: ${formatNinetyDaysDate(variables.responseDate)}

Summary:
${variables.additionalInformation}

This response confirms receipt of your CHIP State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before ${formatNinetyDaysDate(variables.responseDate)}.

If you have questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov
or your state lead.

Thank you!`,
        };
      },
    },
    [Authority["1915b"]]: {
      cms: async (variables: RaiResponse & CommonVariables) => {
        return {
          subject: `Waiver RAI Response for ${variables.id} Submitted`,
          html: `
<p>The OneMAC Submission Portal received a 1915(b) Waiver RAI Response Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='${variables.applicationEndpointUrl}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Waiver Number:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a 1915(b) Waiver RAI Response Submission:

- The submission can be accessed in the OneMAC application, which you can 
  find at ${variables.applicationEndpointUrl}.
- If you are not already logged in, please click the "Login" link at the top 
  of the page and log in using your Enterprise User Administration (EUA) 
  credentials.
- After you have logged in, you will be taken to the OneMAC application. 
  The submission will be listed on the dashboard page, and you can view its 
  details by clicking on its ID number.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Waiver Number: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: RaiResponse & CommonVariables) => {
        return {
          subject: `Your 1915(b) Waiver RAI Response for ${variables.id} has been submitted to CMS`,
          html: `
<p>This response confirms the submission of your 1915(b) Waiver RAI Response to CMS for review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Initial Waiver Number:</b> ${variables.id}
<br><b>Waiver Authority:</b> ${variables.authority}
<br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(variables.responseDate)}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>This response confirms the receipt of your Waiver request or your
response to a Waiver Request for Additional Information (RAI).
You can expect a formal response to your submittal to be issued within 90 days,
before ${formatNinetyDaysDate(variables.responseDate)}.</p>
<p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers, and extension
requests on Waivers only.  Any other correspondence will be disregarded.
</p>
<p>If you have questions, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
          text: `
This response confirms the submission of your 1915(b) Waiver RAI Response to CMS for review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Initial Waiver Number: ${variables.id}
Waiver Authority: ${variables.authority}
90th Day Deadline: ${formatNinetyDaysDate(variables.responseDate)}

Summary:
${variables.additionalInformation}

This response confirms the receipt of your Waiver request or your
response to a Waiver Request for Additional Information (RAI).
You can expect a formal response to your submittal to be issued within 90 days,
before ${formatNinetyDaysDate(variables.responseDate)}.

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers, and extension
requests on Waivers only.  Any other correspondence will be disregarded.

If you have questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
  },
  [Action.WITHDRAW_RAI]: {
    [Authority.MED_SPA]: {
      cms: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<br><b>Files</b>:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and 
instead forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.
</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${relatedEvent.submitterName ?? "Unknown"}}
Email Address: ${relatedEvent.submitterEmail ?? "Unknown"}
SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("html", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and 
instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>Medicaid SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${relatedEvent.submitterName ?? "Unknown"}
Email Address: ${relatedEvent.submitterEmail ?? "Unknown"}
Medicaid SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

If you have questions or did not expect this email, please contact 
spa@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
    [Authority.CHIP_SPA]: {
      cms: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>CHIP SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<br><b>Files</b>:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and 
instead forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.
</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${relatedEvent.submitterName ?? "Unknown"}}
Email Address: ${relatedEvent.submitterEmail ?? "Unknown"}
CHIP SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("html", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and 
instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
      state: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>CHIP SPA Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>If you have any questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${relatedEvent.submitterName ?? "Unknown"}}
Email Address: ${relatedEvent.submitterEmail ?? "Unknown"}
CHIP SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

If you have any questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov
or your state lead.

Thank you!`,
        };
      },
    },
    [Authority["1915b"]]: {
      cms: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>Waiver Number:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<br><b>Files</b>:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.
</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${relatedEvent.submitterName ?? "Unknown"}}
Email Address: ${relatedEvent.submitterEmail ?? "Unknown"}
Medicaid SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, 
responses to Requests for Additional Information (RAI), and extension requests on Waivers only. 
Any other correspondence will be disregarded.

If you have any questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
      state: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>Waiver Number:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<br>
<p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, 
responses to Requests for Additional Information (RAI), and extension requests on Waivers only. 
Any other correspondence will be disregarded.</p>
<p>If you have questions, please contact 
<a href='mailto:SPA@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${relatedEvent.submitterName ?? "Unknown"}}
Email Address: ${relatedEvent.submitterEmail ?? "Unknown"}
Medicaid SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation}

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, 
responses to Requests for Additional Information (RAI), and extension requests on Waivers only. 
Any other correspondence will be disregarded.

If you have any questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
        };
      },
    },
    [Authority["1915c"]]: {
      cms: async (variables: RaiWithdraw & CommonVariables) => {
        const relatedEvent = await getLatestMatchingEvent(
          variables.id,
          Action.RESPOND_TO_RAI,
        );
        return {
          subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
          html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${relatedEvent.submitterName ?? "Unknown"}}
<br><b>Email Address:</b> ${relatedEvent.submitterEmail ?? "Unknown"}
<br><b>Waiver Number:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation}
<p>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
          text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for ${variables.id} was withdrawn by ${variables.submitterName} ${
            variables.submitterEmail
          }.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Waiver Number: ${variables.id}

Summary:
${variables.additionalInformation}

Files:
${formatAttachments("html", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
        };
      },
    },
  },
  [Action.TEMP_EXTENSION]: {
    cms: async (variables: OneMac & CommonVariables) => {
      return {
        subject: `${variables.authority} Waiver Extension ${variables.id} Submitted`,
        html: `
<p>The Submission Portal received a ${
          variables.authority
        } Waiver Extension Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='${variables.applicationEndpointUrl}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Temporary Extension Request Number:</b> ${variables.id}
<br><b>Temporary Extension Type:</b> ${variables.authority}
</p>
Summary:
<br>${variables.additionalInformation}
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
        text: `
The Submission Portal received a ${
          variables.authority
        } Waiver Extension Submission:

- The submission can be accessed in the OneMAC application, which you 
can find at ${variables.applicationEndpointUrl}.
- If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.
- fter you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Temporary Extension Request Number: ${variables.id}
Temporary Extension Type: ${variables.authority}

Files:
${formatAttachments("html", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
      };
    },
    state: async (variables: OneMac & CommonVariables) => {
      return {
        subject: `Your Request for the ${variables.authority} Waiver Extension ${variables.id} has been submitted to CMS`,
        html: `
<p>	
This response confirms you have submitted a ${
          variables.authority
        } Waiver Extension to CMS for review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>Temporary Extension Request Number:</b> ${variables.id}
<br><b>Temporary Extension Type:</b> ${variables.authority}
<br><b>90th Day Deadline:</b> ${formatNinetyDaysDate(
          variables.notificationMetadata?.submissionDate!,
        )}
</p>
Summary:
<br>${variables.additionalInformation}
<p>
<p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers,
and extension requests on Waivers only. Any other correspondence will be disregarded</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
        text: `
This response confirms you have submitted a ${
          variables.authority
        } Waiver Extension to CMS for review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email Address: ${variables.submitterEmail}
Temporary Extension Request Number: ${variables.id}
Temporary Extension Type: ${variables.authority}
90th day deadline: ${formatNinetyDaysDate(
          variables.notificationMetadata?.submissionDate!,
        )}
Summary:
${variables.additionalInformation}

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI), 
and extension requests on Waivers only. Any other correspondence will be disregarded.

If you have any questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
      };
    },
  },
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
async function getLatestMatchingEvent(id: string, actionType: string) {
  const item = await getPackageChangelog(id);
  const events = item.hits.hits.filter(
    (hit) => hit._source.actionType === actionType,
  );
  events.sort((a, b) => b._source.timestamp - a._source.timestamp);
  const latestMatchingEvent = events[0]._source;
  return latestMatchingEvent;
}
