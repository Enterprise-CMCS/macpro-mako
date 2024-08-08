interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * @returns {Promise<EmailTemplate[]>}
 */
const getEmailTemplates = async (): Promise<EmailTemplate[]> => [
  // Medicaid SPA email template group

  // CHIP SPA email template group

  {
    name: "temporary-extension-cms",
    subject: "{{authority}} Waiver Extension {{id}} Submitted",
    html: `
<p>The Submission Portal received a {{authority}} Waiver Extension Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='{{applicationEndpoint}}'>this link</a>.</li>
<li>If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Temporary Extension Request Number:</b> {{id}}
<br><b>Temporary Extension Type:</b> {{authority}}
</p>
Summary:
<br>{{additionalInformation}}
<br>Files:
<br>{{formattedFileList}}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The Submission Portal received a {{authority}} Waiver Extension Submission:

- The submission can be accessed in the OneMAC application, which you 
can find at {{applicationEndpoint}}.
- If you are not already logged in, please click the "Login" link 
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.
- fter you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Temporary Extension Request Number: {{id}}
Temporary Extension Type: {{authority}}

Files:
{{formattedFileList}}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
  },
  {
    name: "temporary-extension-state",
    subject:
      "Your Request for the {{authority}} Waiver Extension {{id}} has been submitted to CMS",
    html: `
<p>	
This response confirms you have submitted a {{authority}} Waiver Extension to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Temporary Extension Request Number:</b> {{id}}
<br><b>Temporary Extension Type:</b> {{authority}}
<br><b>90th Day Deadline:</b> {{ninetyDaysDate}}
</p>
Summary:
<br>{{additionalInformation}}
<p>
<p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers,
and extension requests on Waivers only. Any other correspondence will be disregarded</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
    text: `
This response confirms you have submitted a {{authority}} Waiver Extension to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Temporary Extension Request Number: {{id}}
Temporary Extension Type: {{authority}}
90th day deadline: {{ninetyDaysDate}}
Summary:
{{additionalInformation}}

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI), 
and extension requests on Waivers only. Any other correspondence will be disregarded.

If you have any questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
  },
];

export default getEmailTemplates;
