import { DateTime } from "luxon";
import { Authority, OneMac } from "shared-types";
import {
  CommonVariables,
  formatAttachments,
  formatDate,
  formatNinetyDaysDate,
} from "..";

export const newSubmission = {
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
};
