import { FILE_TYPES } from "shared-types/uploads";
import { ABP_TEMPLATES } from "@/features/faq/content/abpTemplate";
import { renderSection } from "@/features/faq/content/chpRenderSection";
import { ABP_GUIDES } from "@/features/faq/content/abpGuides";
import { MPC_TEMPLATES } from "@/features/faq/content/mpcTemplates";
import { MPC_GUIDES } from "@/features/faq/content/mpcGuides";
import { CHP_TEMPLATES } from "@/features/faq/content/chpTemplates";
import { CHP_GUIDES } from "@/features/faq/content/chpGuides";

type QuestionAnswer = {
  anchorText: string;
  question: string;
  answerJSX: JSX.Element;
};

type FAQContent = {
  sectionTitle: string;
  qanda: QuestionAnswer[];
};

export const helpDeskContact = {
  email: "OneMAC_Helpdesk@cms.hhs.gov",
  phone: "(833) 228-2540",
};

export const oneMACFAQContent: FAQContent[] = [
  {
    sectionTitle: "General",
    qanda: [
      {
        anchorText: "crosswalk-system",
        question: "Which system should I use for my state’s submission?",
        answerJSX: (
          <section>
            <p>
              Check which system to submit your state plan in with this crosswalk training document.
            </p>
            <ul>
              <li>
                <a
                  className="text-blue-800 underline hover:no-underline "
                  href="/onboarding/eligibility-crosswalk-paper-based-state-plan-macpro.pdf"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Crosswalk from Paper-based State Plan to MACPro and MMDL.pdf
                </a>
              </li>
            </ul>
          </section>
        ),
      },
      {
        anchorText: "browsers",
        question: "What browsers can I use to access the system?",
        answerJSX: (
          <p>
            The submission portal works best on Google Chrome (Version 91.0.4472.77 or later),
            Firefox (Version 89.0 or later).
          </p>
        ),
      },
      {
        anchorText: "confirm-email",
        question: "What should we do if we don’t receive a confirmation email?",
        answerJSX: (
          <p>
            Refresh your inbox, check your SPAM filters, then contact the OneMAC Help Desk{" "}
            <a
              className="text-blue-800 underline hover:no-underline "
              href={`mailto:${helpDeskContact.email}`}
            >
              {helpDeskContact.email}
            </a>{" "}
            or call {helpDeskContact.phone} or contact your state lead.
          </p>
        ),
      },
      {
        anchorText: "is-official",
        question: "Is this considered the official state submission?",
        answerJSX: (
          <p>
            Yes, as long as you have the electronic receipt (confirmation email). Your submission is
            considered your official state submission and will only be considered received by CMS if
            you have received the electronic receipt. You should receive an email confirmation that
            the formal action was received along with information about the 90th day. If you do not
            receive a confirmation email for your SPA or waiver submissions, please contact your
            state lead or your state’s CMS lead for HCBS or managed care.
          </p>
        ),
      },
      {
        anchorText: "onemac-roles",
        question: "What are the OneMAC user roles?",
        answerJSX: (
          <table className="faq-table  border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">OneMAC Role</th>
                <th className="border border-gray-300 px-4 py-2">System Utilization</th>
                <th className="border border-gray-300 px-4 py-2">Role Approver</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">CMS Read Only</td>
                <td className="border border-gray-300 px-4 py-2">
                  Read only roles within OneMAC Micro
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  CMS System Admin or CMS Role Approver
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">CMS Reviewer</td>
                <td className="border border-gray-300 px-4 py-2">
                  Can take action on packages within OneMAC Micro
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  CMS System Admin or CMS Role Approver
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">CMS System Admin</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="underline">Approves All</span> roles within IDM
                </td>
                <td className="border border-gray-300 px-4 py-2">IDM Tier 2 Helpdesk</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">CMS Role Approver</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="underline">Approves All</span> roles within IDM
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  CMS System Admin or CMS Role Approver{" "}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">State Submitter</td>
                <td className="border border-gray-300 px-4 py-2">
                  State submitter role within OneMAC can submit, edit, and view packages for the
                  state in which they are assigned
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  State System Admin or CMS System Admin or CMS Role Approver
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">State System Admin</td>
                <td className="border border-gray-300 px-4 py-2">
                  State System Admin role can approve State Submitter roles for the state in which
                  they are assigned
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  CMS System Admin or CMS Role Approver
                </td>
              </tr>
            </tbody>
          </table>
        ),
      },
      {
        anchorText: "acceptable-file-formats",
        question: "What are the kinds of file formats I can upload into OneMAC",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "onboarding-materials",
        question: "Onboarding Materials",
        answerJSX: (
          <ul>
            {[
              ["/onboarding/WelcometoOneMAC.pdf", "Welcome to OneMAC"],
              [
                "/onboarding/IDMInstructionsforOneMACUsers.pdf",
                "IDM Instructions for OneMAC Users",
              ],
              ["/onboarding/OneMACIDMGuide.pdf", "OneMAC IDM Guide"],
              ["/onboarding/OneMACStateUserGuide.pdf", "OneMAC State User Guide"],
              ["/onboarding/OneMACCMSUserGuide.pdf", "OneMAC CMS User Guide"],
            ].map(([file, label]) => (
              <li key={label}>
                <a
                  className="text-blue-800 underline hover:no-underline "
                  href={file}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ),
      },
    ],
  },
  {
    sectionTitle: "State Plan Amendments (SPAs)",
    qanda: [
      {
        anchorText: "spa-id-format",
        question: "What format is used to enter a SPA ID?",
        answerJSX: (
          <>
            Enter the State Plan Amendment transmittal number. Assign consecutive numbers on a
            calendar year basis (e.g., 20-0001-XXXX, 20-0002-XXXX, etc.).
            <br />
            The Official Submission package SPA ID must follow the format SS-YY-#### OR
            SS-YY-####-XXXX to include:
            <ul>
              <li>SS = 2 alpha character (State Abbreviation)</li>
              <li>YY = 2 numeric digits (Year)</li>
              <li>#### = 4 numeric digits (Serial number)</li>
              <li>XXXX = OPTIONAL, 4 characters alpha/numeric modifier (Suffix)</li>
            </ul>
          </>
        ),
      },
      {
        anchorText: "spa-id-format",
        question: "What format is used to enter a SPA ID?",
        answerJSX: (
          <>
            Enter the State Plan Amendment transmittal number. Assign consecutive numbers on a
            calendar year basis (e.g., 20-0001-XXXX, 20-0002-XXXX, etc.).
            <br />
            The Official Submission package SPA ID must follow the format SS-YY-#### OR
            SS-YY-####-XXXX to include:
            <ul>
              <li>SS = 2 alpha character (State Abbreviation)</li>
              <li>YY = 2 numeric digits (Year)</li>
              <li>#### = 4 numeric digits (Serial number)</li>
              <li>XXXX = OPTIONAL, 4 characters alpha/numeric modifier (Suffix)</li>
            </ul>
          </>
        ),
      },
      {
        anchorText: "medicaid-spa-attachments",
        question: "What are the attachments for a Medicaid SPA?",
        answerJSX: (
          <>
            <p>
              SPA submission requirements can be found in regulation&nbsp;
              <a
                className="text-blue-800 underline hover:no-underline "
                href="https://www.ecfr.gov/cgi-bin/text-idx?SID=7d639b87112e05a57ff40731d647bd05&mc=true&node=se42.4.430_112&rgn=div8"
                target="_blank"
                rel="noopener noreferrer"
              >
                42 C.F.R. §430.12.
              </a>
            </p>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table  border-collapse border border-gray-300 w-full ">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    <p>
                      <span>CMS Form 179*</span>
                    </p>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    CMS-179 template that contains specific information for SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">SPA Pages*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Clean versions of the State Plan pages being amended
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cover Letter</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Cover letter to CMS that could outline SPA submission. Please address the cover
                    letter to: Center for Medicaid &amp; CHIP Services (CMCS)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Document Demonstrating Good-Faith Tribal Engagement
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Emails forwarding tribal notice to tribal leaders and tribal contacts; and/or
                    tribal face-to-face meeting agendas indicating SPA discussion
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Existing State Plan Page(s)</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Current approved SPA page, could include track changes to reflect changes
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Public Notice</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Notice to stakeholders and interested parties that outlines the changes being
                    proposed by SPA, feedback received from PN, and copies of websites- notices,
                    state register notices, or newspaper notices that includes the date notice was
                    posted
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Standard Funding Questions (SFQs)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Word document of the funding questions required to be submitted with
                    reimbursement SPAs
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Document that outline the changes SPA is making and the impact that tribes can
                    expect from the SPA
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    UPLs, reimbursement methodology spreadsheet, Copies of legislation, any document
                    that will assist in the review of SPA
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "medicaid-spa-rai-attachments",
        question:
          "What are the attachments for a Medicaid response to Request for Additional Information (RAI)?",
        answerJSX: (
          <>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">RAI Response Letter*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Letter responding to RAI questions, any updated SPA pages, and other
                    documentation requested by CMS in the RAI
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Additional document(s) needed to process the Medicaid SPA RAI submission
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "chip-spa-attachments",
        question: "What are the attachments for a CHIP SPA?",
        answerJSX: (
          <>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table  border-collapse border border-gray-300 w-full ">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Current State Plan*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Current version of the CHIP state plan that details how the State operates its
                    CHIP program
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Amended State Plan Language*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Redline version of proposed changes to the existing CHIP state plan pages. State
                    to provide a redline version and a clean version of the CHIP state plan pages
                    being amended.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Cover letter to CMS with an authorized signature that outlines the purpose of
                    the CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Budget Docs</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Updated 1-year budget if applicable of the State’s planned expenditures if the
                    CHIP SPA submission has a significant impact on the approved budget
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Public Notice</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Process used by the State if applicable to accomplish involvement of the public
                    that occurred specifically for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Consultation process with Indian Tribes if applicable that occurred specifically
                    for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Other document(s) needed to process the CHIP SPA submission
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "chip-spa-rai-attachments",
        question:
          "What are the attachments for a CHIP SPA response to Request for Additional Information (RAI)?",
        answerJSX: (
          <>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table  border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Revised Amended State Plan Language*
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Revision made to the amended state plan language of the CHIP SPA submission.
                    State to provide a redline version and a clean version of the revised amended
                    state plan pages
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Official RAI Response*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Official response to CMS to support RAI inquiries for the CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Budget Docs</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Updated 1-year budget if applicable of the State’s planned expenditures if the
                    CHIP SPA submission has a significant impact on the approved budget
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Public Notice</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Process used by the State if applicable to accomplish involvement of the public
                    that occurred specifically for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Consultation process with Indian Tribes if applicable that occurred specifically
                    for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Other document(s) needed to process the CHIP SPA submission
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "public-health-emergency",
        question: "Can I submit SPAs relating to the Public Health Emergency (PHE) in OneMAC?",
        answerJSX: (
          <p>
            Yes, all PHE-related SPAs should be submitted through OneMAC by completing the Medicaid
            SPA form.
          </p>
        ),
      },
      {
        anchorText: "withdraw-spa-rai-response",
        question: "How do I Withdraw a Formal RAI Response for a Medicaid SPA?",
        answerJSX: (
          <div className="w-full space-y-3">
            <p>
              If a state wishes to withdraw a Formal RAI Response, the state must first contact
              their CMS Point of Contact so the action can be enabled.
            </p>
            <ul className="list-disc ml-8">
              <li>
                As a CMS user, log in to OneMAC and select the link to the SPA ID from the dashboard
              </li>
              <li>
                Then, under Package Actions, select the Enable Formal RAI Response Withdraw link,
                and then Select Submit.
              </li>
            </ul>
            <p>
              After receiving confirmation from your CMS Point of Contact that the Withdraw Formal
              RAI Response feature has been enabled, locate and select the Medicaid SPA submission
              package.
            </p>
            <p>
              The package status remains as Under Review and a substatus of Withdraw Formal RAI
              Response Enabled will be reflected below the status for the SPA or waiver submission
              package.
            </p>
            <p>
              <b>
                Note: These submissions will remain on the clock until the package action has been
                taken.
              </b>
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>
                On the Formal RAI Response Withdraw form, upload any supporting documentation and
                fill out the Additional Information section explaining your need to withdraw the
                Formal RAI Response (all required information is marked with an asterisk).
              </li>
              <li> Select Submit. </li>
              <ul className="list-disc ml-12">
                <li>
                  You will receive a confirmation message asking if you are sure that you want to
                  withdraw the Formal RAI Response. Select Yes, withdraw response.
                </li>
              </ul>
            </ul>
          </div>
        ),
      },
      {
        anchorText: "withdraw-package-spa",
        question: "How do I Withdraw a Package for a Medicaid SPA?",
        answerJSX: (
          <div className="w-full space-y-3">
            <p>
              A state can withdraw a submission package if it is in the Under Review or RAI Issued
              status. However, please note that once withdrawn, a submission package cannot be
              resubmitted to CMS.{" "}
              <b>Completing this action will conclude the review of this SPA package.</b>
            </p>
            <p>There are two methods you can use to withdraw a submission package:</p>
            <ul className="ml-8 list-disc space-y-2">
              <li>
                In OneMAC, Locate and select the link to the SPA ID. Then, under Package Actions,
                select the Withdraw Package link.
              </li>
              <li>
                Alternatively, the Withdraw Package action can be accessed by selecting the three
                dots icon in the Actions column on the Package Dashboard. Then, select Withdraw
                Package from the drop-down list.
              </li>
            </ul>
            <p>
              A warning message will appear letting you know that if the package is withdrawn, it
              cannot be resubmitted and this action will conclude the review of this package.
            </p>
            <p>Select Yes, withdraw package to complete the task.</p>
          </div>
        ),
      },
      {
        anchorText: "withdraw-chip-spa-rai-response",
        question: "How do I Withdraw a Formal RAI Response for a CHIP SPA?",
        answerJSX: (
          <div className="w-full space-y-3">
            <p>
              If a state wishes to withdraw a Formal RAI Response, the state must first contact
              their CMS Point of Contact so the action can be enabled.
            </p>
            <ul className="list-disc ml-8">
              <li>
                As a CMS user, log in to OneMAC and select the link to the SPA ID from the dashboard
              </li>
              <li>
                Then, under Package Actions, select the Enable Formal RAI Response Withdraw link,
                and then Select Submit.
              </li>
            </ul>
            <p>
              After receiving confirmation from your CMS Point of Contact that the Withdraw Formal
              RAI Response feature has been enabled, locate and select the CHIP SPA submission
              package.
            </p>
            <p>
              The package status remains as Under Review and a substatus of Withdraw Formal RAI
              Response Enabled will be reflected below the status for the SPA or waiver submission
              package.
            </p>
            <p>
              <b>
                Note: These submissions will remain on the clock until the package action has been
                taken.
              </b>
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>
                On the Formal RAI Response Withdraw form, upload any supporting documentation and
                fill out the Additional Information section explaining your need to withdraw the
                Formal RAI Response (all required information is marked with an asterisk).
              </li>
              <li> Select Submit. </li>
              <ul className="list-disc ml-12">
                <li>
                  You will receive a confirmation message asking if you are sure that you want to
                  withdraw the Formal RAI Response. Select Yes, withdraw response.
                </li>
              </ul>
            </ul>
          </div>
        ),
      },
      {
        anchorText: "withdraw-package-chip-spa",
        question: "How do I Withdraw a Package for a CHIP SPA?",
        answerJSX: (
          <div className="w-full space-y-3">
            <p>
              A state can withdraw a submission package if it is in the Under Review or RAI Issued
              status. However, please note that once withdrawn, a submission package cannot be
              resubmitted to CMS.{" "}
              <b> Completing this action will conclude the review of this SPA package.</b>
            </p>
            <p>There are two methods you can use to withdraw a submission package: </p>
            <ul className="ml-8 list-disc space-y-2">
              <li>
                In OneMAC, Locate and select the link to the CHIP SPA ID. Then, under Package
                Actions, select the Withdraw Package link.
              </li>
              <li>
                Alternatively, the Withdraw Package action can be accessed by selecting the three
                dots icon in the Actions column on the Package Dashboard. Then, select Withdraw
                Package from the drop-down list.
              </li>
            </ul>
            <p>
              A warning message will appear letting you know that if the package is withdrawn, it
              cannot be resubmitted and this action will conclude the review of this package.
            </p>
            <p>Select Yes, withdraw package to complete the task.</p>
          </div>
        ),
      },
      {
        anchorText: "abp-spa-templates",
        question: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA templates?",
        answerJSX: (
          <section className="space-y-2 p-2">
            <p>
              Medicaid Alternative Benefit Plan (ABP) SPA templates can be downloaded at the links
              below. After downloading and completing the templates you need, upload them as part of
              the SPA submission.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {ABP_TEMPLATES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    {pdf.title}: {pdf.text}
                  </a>
                  {pdf.subtext && (
                    <ul className="list-disc pl-6 space-y-1">
                      {pdf.subtext.map((sub, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {sub}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ),
      },
      {
        anchorText: "abp-implementation-guides-spa",
        question:
          "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?",
        answerJSX: (
          <section className="space-y-2 p-2">
            <p>
              Medicaid Alternative Benefit Plan (ABP) SPA implementation guides can be downloaded at
              the links below.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {ABP_GUIDES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    {pdf.title}: {pdf.text}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ),
      },
      {
        anchorText: "mpc-spa-templates",
        question: "Where can I download Medicaid Premiums and Cost Sharing (MPC) SPA templates?",
        answerJSX: (
          <section className="space-y-2 p-2">
            <p>
              Medicaid Premiums and Cost Sharing (MPC) SPA templates can be downloaded at the links
              below. After downloading and completing the templates you need, upload them as part of
              the SPA submission.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {MPC_TEMPLATES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    {pdf.title}: {pdf.text}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ),
      },
      {
        anchorText: "mpc-spa-implementation-guides",
        question:
          "Where can I download Medicaid Premiums and Cost Sharing (MPC) SPA implementation guides?",
        answerJSX: (
          <section className="space-y-2 p-2">
            <p>
              Medicaid Premiums and Cost Sharing (MPC) SPA implementation guides can be downloaded
              at the links below.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {MPC_GUIDES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    {pdf.title}: {pdf.text}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ),
      },
      {
        anchorText: "chip-spa-templates",
        question: "Where can I download CHIP eligibility SPA templates?",
        answerJSX: (
          <section>
            <p>
              CHIP eligibility SPA templates can be downloaded at the links below. After downloading
              and completing the templates you need, upload them as part of the SPA submission.
            </p>
            <ul className="list-disc pl-6 space-y-2 p-2">
              {renderSection(
                "MAGI Eligibility & Methods",
                CHP_TEMPLATES,
                (template) =>
                  [
                    "CS 7",
                    "CS 8",
                    "CS 9",
                    "CS 10",
                    "CS 11",
                    "CS 12",
                    "CS 13",
                    "CS 15",
                    "CS 16",
                  ].includes(template.title),
                "list-disc pl-6 space-y-2",
              )}
              {renderSection(
                "XXI Medicaid Expansion",
                CHP_TEMPLATES,
                (template) => template.title === "CS 3",
                "list-disc pl-6 space-y-2",
              )}
              {renderSection(
                "Establish 2101(f) Group",
                CHP_TEMPLATES,
                (template) => template.title === "CS 14",
                "list-disc pl-6 space-y-2",
              )}
              {renderSection(
                "Eligibility Processing",
                CHP_TEMPLATES,
                (template) => template.title === "CS 24",
                "list-disc pl-6 space-y-2",
              )}
              {renderSection(
                "Non-Financial Eligibility",
                CHP_TEMPLATES,
                (template) =>
                  [
                    "CS 17",
                    "CS 18",
                    "CS 19",
                    "CS 20",
                    "CS 21",
                    "CS 23",
                    "CS 27",
                    "CS 28",
                    "CS 29",
                  ].includes(template.title),
                "list-disc pl-6 space-y-2",
              )}
            </ul>
          </section>
        ),
      },
      {
        anchorText: "chip-spa-implentation-guides",
        question: "Where can I download CHIP eligibility SPA implementation guides?",
        answerJSX: (
          <section className="space-y-2 ">
            <p>CHIP eligibility SPA implementation guides can be downloaded at the links below.</p>
            <ul className="list-disc pl-6 space-y-2">
              {renderSection(
                "MAGI Eligibility & Methods",
                CHP_GUIDES,
                (guide) =>
                  [
                    "CS 7",
                    "CS 8",
                    "CS 9",
                    "CS 10",
                    "CS 11",
                    "CS 12",
                    "CS 13",
                    "CS 15",
                    "CS 16",
                  ].includes(guide.title),
                "list-disc pl-6 space-y-2 text-blue-600",
              )}
              {renderSection(
                "XXI Medicaid Expansion",
                CHP_GUIDES,
                (guide) => guide.title === "CS 3",
                "list-disc pl-6 space-y-2 text-blue-600",
              )}
              {renderSection(
                "Establish 2101(f) Group",
                CHP_GUIDES,
                (guide) => guide.title === "CS 14",
                "list-disc pl-6 space-y-2 text-blue-600",
              )}
              {renderSection(
                "Eligibility Processing",
                CHP_GUIDES,
                (guide) => guide.title === "CS 24",
                "list-disc pl-6 space-y-2 text-blue-600",
              )}
              {renderSection(
                "Non-Financial Eligibility",
                CHP_GUIDES,
                (guide) =>
                  [
                    "CS 17",
                    "CS 18",
                    "CS 19",
                    "CS 20",
                    "CS 21",
                    "CS 23",
                    "CS 27",
                    "CS 28",
                    "CS 29",
                  ].includes(guide.title),
                "list-disc pl-6 space-y-2 text-blue-600",
              )}
            </ul>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Waivers",
    qanda: [
      {
        anchorText: "initial-waiver-id-format",
        question: "What format is used to enter a 1915(b) Initial Waiver number?",
        answerJSX: (
          <>
            <p>
              1915(b) Initial Waiver numbers must follow the format SS-####.R00.00 or
              SS-#####.R00.00 to include:
            </p>
            <ul>
              <li>SS = 2 character state abbreviation</li>
              <li>##### = 4 or 5 digit initial waiver number</li>
              <li>R00 = initial number</li>
              <li>00 = amendment number (00 for initial)</li>
            </ul>
            <p>
              State abbreviation is separated by dash (-) and later sections are separated by
              periods (.). For example, the waiver number KY-0003.R00.00 is a waiver for the state
              of Kentucky, with an initial waiver number of 0003, no renewal number (R00), and no
              amendment number (00).
            </p>
          </>
        ),
      },
      {
        anchorText: "waiver-renewal-id-format",
        question: "What format is used to enter a 1915(b) Waiver Renewal number?",
        answerJSX: (
          <>
            <p>
              1915(b) Waiver Renewal must follow the format SS-####.R##.00 or SS-#####.R##.00 to
              include:
            </p>
            <ul>
              <li>SS = 2 character state abbreviation</li>
              <li>####(#)= 4 or 5 digit initial waiver number</li>
              <li>R## = renewal number (R01, R02, ...)</li>
              <li>00 = amendment number (00 for renewals)</li>
            </ul>
            <p>
              State abbreviation is separated by dash (-) and later sections are separated by
              periods (.). For example, the waiver number KY-0003.R02.00 is a waiver for the state
              of Kentucky, with a initial waiver number of 0003, a second renewal (R02), and no
              amendment number (00).
            </p>
          </>
        ),
      },
      {
        anchorText: "waiver-amendment-id-format",
        question: "What format is used to enter a 1915(b) Waiver Amendment number?",
        answerJSX: (
          <>
            <p>
              1915(b) Waiver Amendment must follow the format SS-####.R##.## or SS-#####.R##.## to
              include:
            </p>
            <ul>
              <li>SS = 2 character state abbreviation</li>
              <li>####(#)= 4 or 5 digit initial waiver number</li>
              <li>R## = renewal number (R01, R02, ...)</li>
              <li>## = amendment number (01)</li>
            </ul>
            <p>
              State abbreviation is separated by dash (-) and later sections are separated by
              periods (.). For example, the waiver number KY-0003.R02.02 is a waiver for the state
              of Kentucky, with a initial waiver number of 0003, a second renewal (R02), and a
              second amendment (02). Amendments for initial waivers without renewals should use
              “R00” as their renewal number.
            </p>
          </>
        ),
      },
      {
        anchorText: "waiver-id-help",
        question: "Who can I contact to help me figure out the correct 1915(b) Waiver Number?",
        answerJSX: (
          <p>
            Email{" "}
            <a className="text-blue-800 " href="mailto:MCOGDMCOActions@cms.hhs.gov">
              MCOGDMCOActions@cms.hhs.gov
            </a>{" "}
            to get support with determining the correct 1915(b) Waiver Number.
          </p>
        ),
      },
      {
        anchorText: "waiver-c-id",
        question: "What format is used to enter a 1915(c) waiver number?",
        answerJSX: (
          <>
            <p>
              Waiver number must follow the format SS-####.R##.## or SS-#####.R##.## to include:
            </p>
            <ul>
              <li>SS = 2 character state abbreviation</li>
              <li>##### = 4 or 5 digit waiver initial number</li>
              <li>R## = renewal number (R01, R02, ...) (Use R00 for waivers without renewals)</li>
              <li>## = appendix K amendment number (01)</li>
            </ul>
            <p>
              State abbreviation is followed by a dash (-). All other sections are separated by
              periods (.). For example, the waiver number KY-0003.R02.02 is a waiver for the state
              of Kentucky, with a initial waiver number of 0003, the second renewal (R02) and the
              second appendix K amendment (02). Initial waivers without renewals should use “R00” as
              their renewal number.
            </p>
          </>
        ),
      },
      {
        anchorText: "waiverb-attachments",
        question: "What attachments are needed to submit a 1915(b) waiver action?",
        answerJSX: (
          <>
            <p>
              The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301 describe the
              requirements for submitting section 1915(b) and 1915(c) waivers.
            </p>
            <table className="faq-table border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    1915(b)(4) FFS Selective Contracting (Streamlined) waiver application pre-print
                    (Initial, Renewal, Amendment)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    State submission of the 1915(b)(4) Waiver Fee-for-Service Selective Contracting
                    Program preprint narrative (Sections A, B, and C)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    1915(b) Comprehensive (Capitated) Waiver Application Pre-print (Initial,
                    Renewal, Amendment)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    State submission of the 1915(b) preprint narrative (Sections A, B, C and D)
                    (non-FFS Selective Contracting Waiver programs)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    1915(b) Comprehensive (Capitated) Waiver Cost effectiveness spreadsheets
                    (Initial, Renewal, Amendment)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Appendix D Cost Effectiveness Demonstration for 1915(b) Waivers only (not
                    applicable to 1915(b)(4) Fee-for-Service Selective Contracting programs)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    1915(b)(4) FFS Selective Contracting (Streamlined) and 1915(b) Comprehensive
                    (Capitated) Waiver Independent Assessment (first two renewals only)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    State submission of the findings from the Independent Assessment of their
                    1915(b) waiver program
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Tribal Consultation (Initial, Renewal, Amendment)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Document that outlines the changes the waiver action is making and the impact
                    that tribes can expect from the waiver action
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {`Any other documents or spreadsheets that are supplemental to
                    the state's waiver application`}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "waiverb-rai-attachments",
        question:
          "What are the attachments for a 1915(b) Waiver and 1915(c) Appendix K response to Request for Additional Information (RAI)?",
        answerJSX: (
          <>
            <p>
              <span>Note: “*” indicates a required attachment.</span>
            </p>
            <table className="faq-table border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Waiver RAI Response*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Official response to CMS to support RAI inquiries for the Waiver submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {`Any other documents or spreadsheets that are supplemental to
                    the state's response to RAI`}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "waiver-extension-id-format",
        question: "What format is used to enter a 1915(b) or 1915(c) Temporary Extension number?",
        answerJSX: (
          <>
            <p>
              Temporary extension numbers must follow the format SS-####.R##.TE## or
              SS-#####.R##.TE## to include:
            </p>
            <ul>
              <li>SS = 2 character state abbreviation</li>
              <li>####(#)= 4 or 5 digit initial waiver number</li>
              <li>R## = renewal number (R01, R02, ...) (Use R00 for waivers without renewals)</li>
              <li>TE## = temporary extension number, prefixed with a capital TE (TE01)</li>
            </ul>
            <p>
              State abbreviation is separated by dash (-) and later sections are separated by
              periods (.). For example, the waiver number KY-0003.R02.TE02 is a waiver for the state
              of Kentucky, with a initial waiver number of 0003, a second renewal (R02), and a
              second temporary extension (02). Initial waivers without renewals should use “R00” as
              their renewal number.
            </p>
          </>
        ),
      },
      {
        anchorText: "waiver-extension-status",
        question:
          "Why does the status of my Temporary Extension Request continue to show as 'Submitted'?",
        answerJSX: (
          <p>
            Temporary Extensions Requests will only show a status of ‘Submitted’ in the OneMAC
            system at this time. Their status does not update regardless of where that request is in
            the Submission Review process.
          </p>
        ),
      },
      {
        anchorText: "temporary-extensions-b-attachments",
        question:
          "What are the attachments for a 1915(b) Waiver - Request for Temporary Extension?",
        answerJSX: (
          <>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Waiver Extension Request*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    A formal letter addressed to Carrie Smith, Deputy Director of the Disabled and
                    Elderly Health Program Group (DEHPG), requesting a temporary extension beyond
                    the current approved waiver period.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Supplemental documents for the Waiver Extension Request
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "temporary-extensions-c-attachments",
        question:
          "What are the attachments for a 1915(c) Waiver - Request for Temporary Extension?",
        answerJSX: (
          <>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table border-collapse border border-gray-300 w-full ">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Waiver Extension Request*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    A formal letter addressed to George Failla, Director of the Division of HCBS
                    Operations & Oversight requesting a temporary extension beyond the current
                    approved waiver period.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Supplemental documents for the Waiver Extension Request
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "appk",
        question: "Can I submit Appendix K amendments in OneMAC?",
        answerJSX: <p>Yes, you can submit Appendix K amendments in the 1915(c) Appendix K form.</p>,
      },
      {
        anchorText: "appk-attachments",
        question: "What are the attachments for a 1915(c) Appendix K Waiver?",
        answerJSX: (
          <>
            <p>
              The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301 describe the
              requirements for submitting section 1915(b) and 1915(c) waivers.
            </p>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    1915(c) Appendix K Amendment Waiver Template*
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Official amendments to 1915(c) waiver programs addressing or in response to
                    Disasters or Emergencies.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Supplemental documents for the 1915(c) Appendix K waiver amendment
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        anchorText: "withdraw-waiver-rai-response",
        question: "How do I Withdraw a Formal RAI Response for a Medicaid Waiver?",
        answerJSX: (
          <div className="w-full space-y-3">
            <p>
              If a state wishes to withdraw a Formal RAI Response, the state must first contact
              their CMS Point of Contact so the action can be enabled.
            </p>
            <ul className="list-disc ml-8">
              <li>
                As a CMS user, log in to OneMAC and select the link to the Waiver number from the
                dashboard
              </li>
              <li>
                Then, under Package Actions, select the Enable Formal RAI Response Withdraw link,
                and then Select Submit.
              </li>
            </ul>
            <p>
              After receiving confirmation from your CMS Point of Contact that the Withdraw Formal
              RAI Response feature has been enabled, locate and select the Medicaid Waiver
              submission package.
            </p>
            <p>
              The package status remains as Under Review and a substatus of Withdraw Formal RAI
              Response Enabled will be reflected below the status for the SPA or waiver submission
              package.
            </p>
            <p>
              <b>
                Note: These submissions will remain on the clock until the package action has been
                taken.
              </b>
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>
                On the Formal RAI Response Withdraw form, upload any supporting documentation and
                fill out the Additional Information section explaining your need to withdraw the
                Formal RAI Response (all required information is marked with an asterisk).
              </li>
              <li> Select Submit. </li>
              <ul className="list-disc ml-12">
                <li>
                  You will receive a confirmation message asking if you are sure that you want to
                  withdraw the Formal RAI Response. Select Yes, withdraw response.
                </li>
              </ul>
            </ul>
          </div>
        ),
      },
      {
        anchorText: "withdraw-package-waiver",
        question: "How do I Withdraw a Package for a Waiver?",
        answerJSX: (
          <div className="w-full space-y-3">
            <p>
              A state can withdraw a submission package if it is in the Under Review or RAI Issued
              status. However, please note that once withdrawn, a submission package cannot be
              resubmitted to CMS.{" "}
              <b>Completing this action will conclude the review of this SPA package.</b>
            </p>
            <p>There are two methods you can use to withdraw a submission package:</p>
            <ul className="list-disc ml-8 space-y-2">
              <li>
                In OneMAC, Locate and select the link to the Waiver ID. Then, under Package Actions,
                select the Withdraw Package link.
              </li>
              <li>
                Alternatively, the Withdraw Package action can be accessed by selecting the three
                dots icon in the Actions column on the Package Dashboard. Then, select Withdraw
                Package from the drop-down list.
              </li>
            </ul>
            <p>
              A warning message will appear letting you know that if the package is withdrawn, it
              cannot be resubmitted and this action will conclude the review of this package.
            </p>
            <p>Select Yes, withdraw package to complete the task.</p>
          </div>
        ),
      },
    ],
  },
];
