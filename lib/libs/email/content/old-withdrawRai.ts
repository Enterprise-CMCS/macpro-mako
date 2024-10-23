import { Action, Authority, RaiWithdraw } from "shared-types";
import { CommonVariables, formatAttachments, getLatestMatchingEvent } from "..";

export const withdrawRai = {
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
};
