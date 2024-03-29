/**
 * @returns {Promise<{name: string, subject: string, html: string, text}[]>}
 */

module.exports = async () => [
    // Medicaid SPA email template group
    {
    name: "new-submission-medicaid-spa-cms",
    subject:  "Medicaid SPA {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a Medicaid SPA Submission:</p>
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
<br><b>Email:</b> {{submitterEmail}}
<br><b>Medicaid SPA ID: {{id}}</b>
<br><b>Proposed Effective Date:</b> {{proposedEffectiveDateNice}}
</p>
<b>Summary:</b>
<br>{{additionalInformation}}
<br>
<p>
<br><b>Files:</b>
<br>{{formattedFileList}}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a Medicaid SPA Submission:

The submission can be accessed in the OneMAC application, which you can 
find at {{applicationEndpoint}}.

If you are not already logged in, please click the "Login" link at the top 
of the page and log in using your Enterprise User Administration (EUA) 
credentials.

After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.

State or territory: {{territory}}
Name: {{submitterName}}
Email: {{submitterEmail}}
Medicaid SPA ID: {{id}}
Proposed Effective Date: {{proposedEffectiveDateNice}}

Summary:
{{additionalInformation}}

Files:
{{textFileList}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "new-submission-medicaid-spa-state",
    subject:  "Your Medicaid SPA {{id}} has been submitted to CMS",
    html: `
<p>This response confirms that you submitted a Medicaid SPA to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Medicaid SPA ID: {{id}}</b>
<br><b>Proposed Effective Date:</b> {{proposedEffectiveDateNice}}
<br><b>90th Day Deadline:</b> {{ninetyDaysDate}}
</p>
<b>Summary:</b>
<br>{{additionalInformation}}
<br>
<p>This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDate}}.</p>
<p>This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
This response confirms that you submitted a Medicaid SPA to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Medicaid SPA ID: {{id}}
Proposed Effective Date:  {{proposedEffectiveDateNice}}
90th Day Deadline: {{ninetyDaysDate}}

Summary:
{{additionalInformation}}

This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDate}}.

This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.

If you have questions or did not expect this email, please contact 
SPA@cms.hhs.gov.

Thank you!`,
},
{
    name: "new-submission-1915b-cms",
    subject:  "{{authority}} {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a 1915(b) {{actionType}} submission:</p>
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
<br><b>Email:</b> {{submitterEmail}}
<br><b>1915(b) {{actionType}} Number:</b> {{id}}</b>
<br><b>Waiver Authority:</b> {{authority}}
<br><b>Proposed Effective Date:</b> {{proposedEffectiveDateNice}}
</p>
<b>Summary:</b>
<br>{{additionalInformation}}
<br>
<p>
<br><b>Files:</b>
<br>{{formattedFileList}}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a 1915(b) initial waiver submission:

The submission can be accessed in the OneMAC application, which you 
can find at <a href='{{applicationEndpoint}}'>this link</a>.

If you are not already logged in, please click the "Login" link
at the top of the page and log in using your Enterprise User 
Administration (EUA) credentials.

After you have logged in, you will be taken to the OneMAC application.
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.


State or territory: {{territory}}
Name: {{submitterName}}
Email: {{submitterEmail}}
Initial Waiver Number: {{id}}</b>
Waiver Authority: {{authority}}
Proposed Effective Date: {{proposedEffectiveDateNice}}

Summary:
{{additionalInformation}}

Files:
{{formattedFileList}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "new-submission-1915b-state",
    subject:  "Your {{actionType}} {{id}} has been submitted to CMS",
    html: `
<p>This response confirms the submission of your {{actionType}} to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>{{actionType}} Number:</b> {{id}}</b>
<br><b>Waiver Authority:</b> {{authority}}
<br><b>Proposed Effective Date:</b> {{proposedEffectiveDateNice}}
<br><b>90th Day Deadline:</b> {{ninetyDaysDate}}
</p>
<b>Summary:</b>
<br>{{additionalInformation}}
<br>
<p>This response confirms the receipt of your Waiver request or your response
to a Waiver Request for Additional Information (RAI). You can expect a formal
response to your submittal to be issued within 90 days,
before {{ninetyDaysDate}}.</p>
<p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers,
and extension requests on Waivers only. Any other correspondence will be disregarded</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
    text: `
This response confirms the submission of your Initial Waiver to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Initial Waiver Number: {{id}}</b>
Waiver Authority: {{authority}}
Proposed Effective Date: {{proposedEffectiveDateNice}}
90th Day Deadline: {{ninetyDaysDate}}

Summary:
{{additionalInformation}}

This response confirms the receipt of your Waiver request or your response
to a Waiver Request for Additional Information (RAI). You can expect a formal
response to your submittal to be issued within 90 days,
before {{ninetyDaysDate}}.

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers,
and extension requests on Waivers only. Any other correspondence will be disregarded</p>

If you have questions or did not expect this email, please contact
SPA@cms.hhs.gov or your state lead.

Thank you!`,
    },
{
    name: "withdraw-package-1915b-state",
    subject:  "1915(b) Waiver {{id}} Withdrawal Confirmation",
    html: `
<p>This email is to confirm 1915(b) Waiver {{id}} was withdrawn
by {{submitterName}}. The review of 1915(b) Waiver {{id}} has concluded.</p>
<p>If you have questions, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a> or your state lead.</p>
<p>Thank you!</p>`,
    text: `
This email is to confirm 1915(b) Waiver {{id}} was withdrawn by {{submitterName}}.
The review of 1915(b) Waiver {{id}} has concluded.

If you have questions, please contact spa@cms.hhs.gov or your state lead.

Thank you!`,
},
{
    name: "respond-to-rai-medicaid-spa-cms",
    subject:  "Medicaid SPA RAI Response for {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:</p>
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
<br><b>Email:</b> {{submitterEmail}}
<br><b>Medicaid SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>
<br>Files:
<br>{{formattedFileList}}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:

The submission can be accessed in the OneMAC application, which you can 
find at {{applicationEndpoint}}.

If you are not already logged in, please click the "Login" link at the top 
of the page and log in using your Enterprise User Administration (EUA) 
credentials.

After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.

State or territory: {{territory}}
Name: {{submitterName}}
Email: {{submitterEmail}}
Medicaid SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

Files:
{{textFileList}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "respond-to-rai-medicaid-spa-state",
    subject:  "Your Medicaid SPA RAI Response for {{id}} has been submitted to CMS",
    html: `
<p>This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Medicaid SPA ID:</b> {{id}}
<br><b>90th Day Deadline:</b> {{ninetyDaysDate}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms receipt of your Medicaid State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDate}}.</p>
<p>This mailbox is for the submittal of State Plan Amendments and non-web 
based responses to Requests for Additional Information (RAI) on submitted 
SPAs only. Any other correspondence will be disregarded.</p>
<p>If you have questions, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Medicaid SPA ID: {{id}}
90th Day Deadline: {{ninetyDaysDate}}

Summary:
{{additionalInformation}}

This response confirms receipt of your Medicaid State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDate}}.

This mailbox is for the submittal of State Plan Amendments and non-web 
based responses to Requests for Additional Information (RAI) on submitted 
SPAs only. Any other correspondence will be disregarded.

If you have questions, please contact SPA@cms.hhs.gov.

Thank you!`,
},
{
    name: "withdraw-rai-medicaid-spa-cms",
    subject:  "Withdraw Formal RAI Response for SPA Package {{id}}",
    html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{initialSubmitterName}}
<br><b>Email Address:</b> {{initialSubmitterEmail}}
<br><b>SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<br><b>Files</b>:
<br>{{formattedFileList}}
<p>If the contents of this email seem suspicious, do not open them, and 
instead forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.
</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.

State or territory: {{territory}}
Name: {{initialSubmitterName}}
Email Address: {{initialSubmitterEmail}}
SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

Files:
{{formattedFileList}}

If the contents of this email seem suspicious, do not open them, and 
instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "withdraw-rai-medicaid-spa-state",
    subject:  "Withdraw Formal RAI Response for SPA Package {{id}}",
    html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{initialSubmitterName}}
<br><b>Email Address:</b> {{initialSubmitterEmail}}
<br><b>Medicaid SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:spa@cms.hhs.gov'>spa@cms.hhs.gov</a>.
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.

State or territory: {{territory}}
Name: {{initialSubmitterName}}
Email Address: {{initialSubmitterEmail}}
Medicaid SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

If you have questions or did not expect this email, please contact 
spa@cms.hhs.gov.

Thank you!`,
},
{
    name: "withdraw-package-medicaid-spa-cms",
    subject:  "SPA Package {{id}} Withdraw Request",
    html: `
<p>The OneMAC Submission Portal received a request to withdraw the package below. 
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email:</b> {{submitterEmail}}
<br><b>Medicaid SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a request to withdraw the package below. 
The package will no longer be considered for CMS review:

State or territory: {{territory}}
Name: {{submitterName}}
Email: {{submitterEmail}}
Medicaid SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "withdraw-package-medicaid-spa-state",
    subject:  "Medicaid SPA Package {{id}} Withdrawal Confirmation",
    html: `
<p>This email is to confirm Medicaid SPA {{id}} was withdrawn
by {{submitterName}}. The review of Medicaid SPA {{id}} has concluded.</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
This email is to confirm Medicaid SPA {{id}} was withdrawn
by {{submitterName}}. The review of Medicaid SPA {{id}} has concluded.</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
},

// CHIP SPA email template group
{
    name: "new-submission-chip-spa-cms",
    subject:  "New CHIP SPA {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a CHIP State Plan Amendment:</p>
<ul>
<li>The submission can be accessed in the OneMAC Micro application, which 
you can find at <a href='{{applicationEndpoint}}'>
{{applicationEndpoint}}</a>.</li>
<li>If you are not already logged in, please click the "Login" link at the 
top of the page and log in using your Enterprise User Administration (EUA) 
credentials.</li>
<li>After you have logged in, you will be taken to the OneMAC Micro 
application. The submission will be listed on the dashboard page, and you 
can view its details by clicking on its ID number.</li>
</ul>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email:</b> {{submitterEmail}}
<br><b>CHIP SPA Package ID:</b> {{id}}
</p><br/>
Summary:
<br>{{additionalInformation}}
<br>
<p>
<br>Files:
<br>{{formattedFileList}}
<br></p>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a CHIP State Plan Amendment:

- The submission can be accessed in the OneMAC Micro application, which you can 
  find at {{applicationEndpoint}}.
- If you are not already logged in, please click the "Login" link at the 
  top of the page and log in using your Enterprise User Administration (EUA) 
  credentials.
- After you have logged in, you will be taken to the OneMAC Micro 
  application. The submission will be listed on the dashboard page, and you 
  can view its details by clicking on its ID number.

State or territory: {{territory}}
Name: {{submitterName}}
Email: {{submitterEmail}}
CHIP SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

Files:
{{formattedFileList}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "new-submission-chip-spa-state",
    subject:  "Your CHIP SPA {{id}} has been submitted to CMS",
    html: `
<p>This is confirmation that you submitted a CHIP State Plan Amendment 
to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>CHIP SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms the receipt of your CHIP State Plan Amendment 
(CHIP SPA). You can expect a formal response to your submittal from CMS 
at a later date.
</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov'>CHIPSPASubmissionMailBox@CMS.HHS.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
This is confirmation that you submitted a CHIP State Plan Amendment 
to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
CHIP SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

This response confirms the receipt of your CHIP State Plan Amendment 
(CHIP SPA). You can expect a formal response to your submittal from CMS 
at a later date.

If you have questions or did not expect this email, please contact 
CHIPSPASubmissionMailBox@CMS.HHS.gov.

Thank you!`,
},
{
    name: "respond-to-rai-chip-spa-cms",
    subject:  "CHIP SPA RAI Response for {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a CHIP SPA RAI Response Submission:</p>
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
<br><b>CHIP SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>
<br>Files:
<br>{{formattedFileList}}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a CHIP SPA RAI Response Submission:

- The submission can be accessed in the OneMAC application, which you can 
  find at {{applicationEndpoint}}.
- If you are not already logged in, please click the "Login" link at the top 
  of the page and log in using your Enterprise User Administration (EUA) 
  credentials.
- After you have logged in, you will be taken to the OneMAC application. 
  The submission will be listed on the dashboard page, and you can view its 
  details by clicking on its ID number.

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
CHIP SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

Files:
{{textFileList}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "respond-to-rai-chip-spa-state",
    subject:  "Your CHIP SPA RAI Response for {{id}} has been submitted to CMS",
    html: `
<p>This response confirms you submitted a CHIP SPA RAI Response to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>CHIP SPA Package ID:</b> {{id}}
<br><b>90th Day Deadline:</b> {{ninetyDaysDate}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms receipt of your CHIP State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDate}}.</p>
<p>If you have questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
    text: `
This response confirms you submitted a CHIP SPA RAI Response to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
CHIP SPA Package ID: {{id}}
90th Day Deadline: {{ninetyDaysDate}}

Summary:
{{additionalInformation}}

This response confirms receipt of your CHIP State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDate}}.

If you have questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov
or your state lead.

Thank you!`,
},
{
    name: "withdraw-rai-chip-spa-cms",
    subject:  "Withdraw Formal RAI Response for CHIP SPA Package {{id}}",
    html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{initialSubmitterName}}
<br><b>Email Address:</b> {{initialSubmitterEmail}}
<br><b>CHIP SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<br><b>Files</b>:
<br>{{formattedFileList}}
<p>If the contents of this email seem suspicious, do not open them, and 
instead forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.
</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.

State or territory: {{territory}}
Name: {{initialSubmitterName}}
Email Address: {{initialSubmitterEmail}}
CHIP SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

Files:
{{formattedFileList}}

If the contents of this email seem suspicious, do not open them, and 
instead forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "withdraw-rai-chip-spa-state",
    subject:  "Withdraw Formal RAI Response for CHIP SPA Package {{id}}",
    html: `
<p>The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{initialSubmitterName}}
<br><b>Email Address:</b> {{initialSubmitterEmail}}
<br><b>CHIP SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>If you have any questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a request to withdraw the Formal 
RAI Response. You are receiving this email notification as the Formal RAI 
for {{id}} was withdrawn by {{submitterName}} {{submitterEmail}}.

State or territory: {{territory}}
Name: {{initialSubmitterName}}
Email Address: {{initialSubmitterEmail}}
CHIP SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

If you have any questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov
or your state lead.

Thank you!`,
},
{
    name: "withdraw-package-chip-spa-cms",
    subject:  "CHIP SPA Package {{id}} Withdraw Request",
    html: `
<p>The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>CHIP SPA Package ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead forward this email to 
<a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>
</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
CHIP SPA Package ID: {{id}}

Summary:
{{additionalInformation}}

If the contents of this email seem suspicious, do not open them, and instead forward this email to SPAM@cms.hhs.gov'

Thank you!`,
},
{
    name: "withdraw-package-chip-spa-state",
    subject:  "CHIP SPA Package {{id}} Withdrawal Confirmation",
    html: `
<p>This email is to confirm CHIP SPA {{id}} was withdrawn
by {{submitterName}}. The review of CHIP SPA {{id}} has concluded.</p>
<p>If you have any questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
    text: `
This email is to confirm CHIP SPA {{id}} was withdrawn
by {{submitterName}}. The review of CHIP SPA {{id}} has concluded.

If you have any questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov or your state lead.

Thank you!`,
    },
{
    name: "respond-to-rai-1915b-cms",
    subject:  "Waiver RAI Response for {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a 1915(b) Waiver RAI Response Submission:</p>
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
<br><b>Waiver Number:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>
<br>Files:
<br>{{formattedFileList}}
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a 1915(b) Waiver RAI Response Submission:

- The submission can be accessed in the OneMAC application, which you can 
  find at {{applicationEndpoint}}.
- If you are not already logged in, please click the "Login" link at the top 
  of the page and log in using your Enterprise User Administration (EUA) 
  credentials.
- After you have logged in, you will be taken to the OneMAC application. 
  The submission will be listed on the dashboard page, and you can view its 
  details by clicking on its ID number.

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Waiver Number: {{id}}

Summary:
{{additionalInformation}}

Files:
{{textFileList}}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
},
{
    name: "respond-to-rai-1915b-state",
    subject:  "Your 1915(b) Waiver RAI Response for {{id}} has been submitted to CMS",
    html: `
<p>This response confirms the submission of your 1915(b) Waiver RAI Response to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Initial Waiver Number:</b> {{id}}
<br><b>Waiver Authority:</b> {{authority}}
<br><b>90th Day Deadline:</b> {{ninetyDaysDate}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms the receipt of your Waiver request or your
response to a Waiver Request for Additional Information (RAI).
You can expect a formal response to your submittal to be issued within 90 days,
before {{ninetyDaysDate}}.</p>
<p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers, and extension
requests on Waivers only.  Any other correspondence will be disregarded.
</p>
<p>If you have questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.</p>
<p>Thank you!</p>`,
    text: `
This response confirms the submission of your 1915(b) Waiver RAI Response to CMS for review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Initial Waiver Number: {{id}}
Waiver Authority: {{authority}}
90th Day Deadline: {{ninetyDaysDate}}

Summary:
{{additionalInformation}}

This response confirms the receipt of your Waiver request or your
response to a Waiver Request for Additional Information (RAI).
You can expect a formal response to your submittal to be issued within 90 days,
before {{ninetyDaysDate}}.

This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
responses to Requests for Additional Information (RAI) on Waivers, and extension
requests on Waivers only.  Any other correspondence will be disregarded.

If you have questions, please contact 
<a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
or your state lead.

Thank you!`,
}
];