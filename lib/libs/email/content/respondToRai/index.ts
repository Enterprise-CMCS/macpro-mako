import { Authority, EmailAddresses, RaiResponse } from "shared-types";
import {
  CommonVariables,
  formatAttachments,
  formatNinetyDaysDate,
} from "../..";

export const respondToRai = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail, // TODO: CPOC and SRT should be added
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
<br>${variables.additionalInformation || "N/A"}
<br>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<br>

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
${variables.additionalInformation || "N/A"}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
      };
    },
    state: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>"`,
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
<br>${variables.additionalInformation || "N/A"}
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
${variables.additionalInformation || "N/A"}

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
    cms: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.chipInbox, // TODO: CPOC and SRT should be added
        cc: variables.emails.chipCcList,
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
<br>${variables.additionalInformation || "N/A"}
<br>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}
<br>

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
${variables.additionalInformation || "N/A"}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
      };
    },
    state: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>"`,
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
<br>${variables.additionalInformation || "N/A"}
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
${variables.additionalInformation || "N/A"}

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
    cms: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `${variables.emails.osgEmail};${variables.emails.dmcoEmail}`, // TODO: Should be also sent to CPOC and SRT
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
<br>${variables.additionalInformation || "N/A"}
<br>
<br>Files:
<br>${formatAttachments("html", variables.attachments)}

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
${variables.additionalInformation || "N/A"}

Files:
${formatAttachments("text", variables.attachments)}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
      };
    },
    state: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>"`, // TODO: suppose to go to all state users but we dont have that data
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
<br>${variables.additionalInformation || "N/A"}
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
${variables.additionalInformation || "N/A"}

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
  state: async (
    variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
  ) => {
    return {
      to: `"${variables.submitterName}" <${variables.submitterEmail}>"`, // TODO: all state users
      subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id} `,
      html: `
    <p>The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${
      variables.id
    } was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.
    <p>
    <br><b>State or territory:</b> ${variables.territory}
    <br><b>Name:</b> ${variables.submitterName}
    <br><b>Email Address:</b> ${variables.submitterEmail}
    <br><b>Waiver Number:</b> ${variables.id}
    </p>
    Summary:
    <br>${variables.additionalInformation || "N/A"}
    <br>
    <p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI), and extension requests on Waivers only. Any other correspondence will be disregarded.
    </p>
    <p>If you have questions or did not expect this email, please contact 
    <a href='mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov'>CHIPSPASubmissionMailBox@CMS.HHS.gov</a> or your state lead.</p>
    <p>Thank you!</p>`,
      text: `
    The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${
      variables.id
    } was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.
    
    State or territory: ${variables.territory}
    Name: ${variables.submitterName}
    Email Address: ${variables.submitterEmail}
    CHIP SPA Package ID: ${variables.id}
    
    Summary:
    ${variables.additionalInformation || "N/A"}
    
This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI), and extension requests on Waivers only. Any other correspondence will be disregarded.
    
    If you have questions or did not expect this email, please contact 
    CHIPSPASubmissionMailBox@CMS.HHS.gov.
    
    Thank you!`,
    };
  },
};
