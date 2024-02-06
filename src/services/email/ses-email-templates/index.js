/**
 * @param {Object} serverless - Serverless instance
 * @param {Object} options - runtime options
 * @returns {Promise<{name: string, subject: string, html: string, text}[]>}
 */

module.exports = async (serverless, options) => [{
    name: "initial-submission-cms",
    subject:  "{{authority}} {{id}} Submitted",
    html: `
    <p>The OneMAC Submission Portal received a {{authority}} Submission:</p>
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
    {{packageDetails}}
    {{packageWarnings}}
    <br>
    <p>If the contents of this email seem suspicious, do not open them, and instead 
    forward this email to <a href='mailto:SPAM@cms.hhs.gov'>SPAM@cms.hhs.gov</a>.</p>
    <p>Thank you!</p>`,
    text: `The OneMAC Submission Portal received a {{authority}} Submission:
    \n\nThe submission can be accessed in the OneMAC application, which you can 
    find at {{applicationEndpoint}}.\n\n
    If you are not already logged in, please click the \"Login\" link at the top 
    of the page and log in using your Enterprise User Administration (EUA) 
    credentials.\n\n
    After you have logged in, you will be taken to the OneMAC application. 
    The submission will be listed on the dashboard page, and you can view its 
    details by clicking on its ID number.\n\n
    {{packageDetails}}
    {{packageWarnings}}\n\n
    If the contents of this email seem suspicious, do not open them, and instead 
    forward this email to SPAM@cms.hhs.gov.\n\n
    Thank you!`,
}];
