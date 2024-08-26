import { Authority, EmailAddresses, WithdrawPackage } from "shared-types";
import { CommonVariables } from "../..";

export const withdrawPackage = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: WithdrawPackage & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        cc: variables.emails.dpoEmail,
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
<br>${variables.additionalInformation ?? "No additional information submitted"}

<p>Thank you!</p>`,
        text: `
The OneMAC Submission Portal received a request to withdraw the package below. 
The package will no longer be considered for CMS review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
Medicaid SPA Package ID: ${variables.id}

Summary:
${variables.additionalInformation ?? "No additional information submitted"}

If the contents of this email seem suspicious, do not open them, and instead 
forward this email to SPAM@cms.hhs.gov.

Thank you!`,
      };
    },
    state: async (
      variables: WithdrawPackage & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>"`,
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
    cms: async (
      variables: WithdrawPackage & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.chipCcList, // TODO: Suppose to get CPOC and SRT
        cc: variables.emails.chipCcList,
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
<br>${variables.additionalInformation ?? "No additional information submitted"}
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
${variables.additionalInformation ?? "No additional information submitted"}

 '

Thank you!`,
      };
    },

    // The confluence page shows this email should not be sent: https://qmacbis.atlassian.net/wiki/spaces/MACPRO/pages/3286138882/Email+Notifications+for+Package+Actions#State-Users.3
    //     state: async (
    //       variables: WithdrawPackage & CommonVariables & { emails: EmailAddresses },
    //     ) => {
    //       return {
    //         to: `"${variables.submitterName}" <${variables.submitterEmail}>"`,
    //         subject: `CHIP SPA Package ${variables.id} Withdrawal Confirmation`,
    //         html: `
    // <p>This email is to confirm CHIP SPA ${variables.id} was withdrawn
    // by ${variables.submitterName}. The review of CHIP SPA ${variables.id} has concluded.</p>
    // <p>If you have any questions, please contact
    // <a href='mailto:CHIPSPASubmissionMailbox@cms.hhs.gov'>CHIPSPASubmissionMailbox@cms.hhs.gov</a>
    // or your state lead.</p>
    // <p>Thank you!</p>`,
    //         text: `
    // This email is to confirm CHIP SPA ${variables.id} was withdrawn
    // by ${variables.submitterName}. The review of CHIP SPA ${variables.id} has concluded.

    // If you have any questions, please contact CHIPSPASubmissionMailbox@cms.hhs.gov or your state lead.

    // Thank you!`,
    //       };
    //     },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: WithdrawPackage & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `Waiver Package ${variables.id} Withdraw Request`,
        html: `
<p>The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:</p>
<p>
<br><b>State or territory:</b> ${variables.territory}
<br><b>Name:</b> ${variables.submitterName}
<br><b>Email Address:</b> ${variables.submitterEmail}
<br><b>${variables.authority} Package ID:</b> ${variables.id}
</p>
Summary:
<br>${variables.additionalInformation ?? "No additional information submitted"}
<br>
<br>

<p>Thank you!</p>`,
        text: `
The OneMAC Submission Portal received a request to withdraw the package below.
The package will no longer be considered for CMS review:

State or territory: ${variables.territory}
Name: ${variables.submitterName}
Email: ${variables.submitterEmail}
Waiver Number: ${variables.id}

Summary:
${variables.additionalInformation ?? "No additional information submitted"}

 .

Thank you!`,
      };
    },
    state: async (
      variables: WithdrawPackage & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: `"${variables.submitterName}" <${variables.submitterEmail}>"`,
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
};
