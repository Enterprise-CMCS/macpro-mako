import { EmailAddresses, OneMac } from "shared-types";
import {
  CommonVariables,
  formatAttachments,
  formatNinetyDaysDate,
} from "../..";

export const tempExtention = {
  cms: async (
    variables: OneMac & CommonVariables & { emails: EmailAddresses },
  ) => {
    return {
      to: variables.emails.osgEmail,
      subject: `${variables.authority} Waiver Extension ${variables.id} Submitted`,
      html: `
<p>The OneMAC Submission Portal received a ${
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
<br>${variables.additionalInformation || "N/A"}
<br>Files:
<br>${formatAttachments("html", variables.attachments)}

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

 .

Thank you!`,
    };
  },
  state: async (
    variables: OneMac & CommonVariables & { emails: EmailAddresses },
  ) => {
    return {
      to: `"${variables.submitterName}" <${variables.submitterEmail}>"`,
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
        variables.notificationMetadata?.submissionDate as number,
      )}
</p>
Summary:
<br>${variables.additionalInformation || "N/A"}
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
        variables.notificationMetadata?.submissionDate as number,
      )}
Summary:
${variables.additionalInformation || "N/A"}

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI), 
and extension requests on Waivers only. Any other correspondence will be disregarded.

If you have any questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
    };
  },
};
