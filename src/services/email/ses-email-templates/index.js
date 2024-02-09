/**
 * @param {Object} serverless - Serverless instance
 * @param {Object} options - runtime options
 * @returns {Promise<{name: string, subject: string, html: string, text}[]>}
 */

module.exports = async (serverless, options) => [{
    name: "initial-submission-medicaid-spa-cms",
    subject:  "Medicaid SPA {{id}} Submitted",
    html: `
<p>The OneMAC Submission Portal received a Medicaid SPA Submission:</p>
<ul>
<li>The submission can be accessed in the OneMAC application, which you 
can find at <a href='{{applicationEndpoint}}'>this link</a>.</li>
<li>If you are not already logged in, please click the \"Login\" link 
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
<p>
<br><b>Files:</b>
<br>{{formattedFileList}}
<br>
<p>If the contents of this email seem suspicious, do not open them, and instead 
forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
The OneMAC Submission Portal received a Medicaid SPA Submission:
\n\nThe submission can be accessed in the OneMAC application, which you can 
find at {{applicationEndpoint}}.\n\n
If you are not already logged in, please click the \"Login\" link at the top 
of the page and log in using your Enterprise User Administration (EUA) 
credentials.\n\n
After you have logged in, you will be taken to the OneMAC application. 
The submission will be listed on the dashboard page, and you can view its 
details by clicking on its ID number.\n\n
State or territory: {{territory}}\n
Name: {{submitterName}}\n
Email: {{submitterEmail}}\n
Medicaid SPA ID: {{id}}\n
Proposed Effective Date: {{proposedEffectiveDateNice}}\n
\n\n
Files:\n
{{textFileList}}\n\n
If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.\n\n
Thank you!`,
},
{
    name: "initial-submission-medicaid-spa-state",
    subject:  "Your Medicaid SPA {{id}} has been submitted to CMS",
    html: `
<p>This response confirms that you submitted a Medicaid SPA to CMS for review:</p>
<p>
<br><b>State or territory:</b> {{territory}}
<br><b>Name:</b> {{submitterName}}
<br><b>Email Address:</b> {{submitterEmail}}
<br><b>Medicaid SPA ID: {{id}}</b>
<br><b>Proposed Effective Date:</b> {{proposedEffectiveDateNice}}
<br><b>90th Day Deadline:</b> not sure where we are getting this from
</p>
<>
Summary:
<br>{{additionalInformation}}
<br>
<p>This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before [insert 90th day deadline].</p>
<p>This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.</p>
<p>If you have questions or did not expect this email, please contact 
<a href='mailto:SPA@cms.hhs.gov'>SPA@cms.hhs.gov</a>.</p>
<p>Thank you!</p>`,
    text: `
This response confirms that you submitted a Medicaid SPA to CMS for review:\n\n
State or territory: {{territory}}\n
Name: {{submitterName}}\n
Email Address: {{submitterEmail}}\n
Medicaid SPA ID: {{id}}\n
Proposed Effective Date:  {{proposedEffectiveDateNice}}\n
90th Day Deadline: not sure where we are getting this from\n
\n
Summary:\n
{{additionalInformation}}\n\n
This response confirms the receipt of your Medicaid State Plan Amendment 
(SPA or your response to a SPA Request for Additional Information (RAI)). 
You can expect a formal response to your submittal to be issued within 90 days, 
before [insert 90th day deadline].\n\n
This mailbox is for the submittal of State Plan Amendments and non-web-based
responses to Requests for Additional Information (RAI) on submitted SPAs only.
Any other correspondence will be disregarded.\n\n
If you have questions or did not expect this email, please contact 
SPA@cms.hhs.gov.\n\n
Thank you!`,
}];
