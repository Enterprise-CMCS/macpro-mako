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
<br><b>90th Day Deadline:</b> {{ninetyDaysDateNice}}
</p>
<b>Summary:</b>
<br>{{additionalInformation}}
<br>
<p>This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDateNice}}.</p>
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
90th Day Deadline: {{ninetyDaysDateNice}}

Summary:
{{additionalInformation}}

This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDateNice}}.

This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.

If you have questions or did not expect this email, please contact 
SPA@cms.hhs.gov.

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
<br><b>90th Day Deadline:</b> {{ninetyDaysDateNice}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms receipt of your Medicaid State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDateNice}}.</p>
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
90th Day Deadline: {{ninetyDaysDateNice}}

Summary:
{{additionalInformation}}

This response confirms receipt of your Medicaid State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDateNice}}.

This mailbox is for the submittal of State Plan Amendments and non-web 
based responses to Requests for Additional Information (RAI) on submitted 
SPAs only. Any other correspondence will be disregarded.

If you have questions, please contact SPA@cms.hhs.gov.

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
    subject:  "SPA Package {{id}} Withdraw Request",
    html: `
<p>This is confirmation that you have requested to withdraw the package below. 
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Medicaid SPA ID:</b> {{id}}
</p>
Summary:
<br>{{additionalInformation}}
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
This is confirmation that you have requested to withdraw the package below. 
The package will no longer be considered for CMS review:

State or territory: {{territory}}
Name: {{submitterName}}
Email Address: {{submitterEmail}}
Medicaid SPA ID: {{id}}

Summary:
{{additionalInformation}}

If you have questions or did not expect this email, please contact 
spa@cms.hhs.gov.

Thank you!`,
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
<br><b>90th Day Deadline:</b> {{ninetyDaysDateNice}}
</p>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms receipt of your CHIP State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDateNice}}.</p>
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
90th Day Deadline: {{ninetyDaysDateNice}}

Summary:
{{additionalInformation}}

This response confirms receipt of your CHIP State Plan Amendment (SPA 
or your response to a SPA Request for Additional Information (RAI)). You can 
expect a formal response to your submittal to be issued within 90 days, 
before {{ninetyDaysDateNice}}.

If you have questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov
or your state lead.

Thank you!`,
}];