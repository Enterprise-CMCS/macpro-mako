import { ABP_GUIDES } from "../content/abpGuides";
import { ABP_TEMPLATES } from "../content/abpTemplate";
import { CHP_GUIDES } from "../content/chpGuides";
import { CHP_TEMPLATES } from "../content/chpTemplates";
import { MPC_GUIDES } from "../content/mpcGuides";
import { MPC_TEMPLATES } from "../content/mpcTemplates";
import { handleSupportLinkClick, PdfLink, PdfList, renderSection } from "./utils";

const anchorsToHide = [
  "spa-admendments",
  "abp-spa-templates",
  "abp-implementation-guides-spa",
  "mpc-spa-templates",
  "mpc-spa-implementation-guides",
  "chip-spa-templates",
  "chip-spa-implentation-guides",
];

const chipSpaAttachmentsAnswer = ({
  isChipSpaDetailsEnabled = false,
}: {
  isChipSpaDetailsEnabled: boolean;
}) =>
  isChipSpaDetailsEnabled ? (
    <>
      <p className="font-bold">CHIP SPA Attachment Types:</p>
      <p className="ml-12">Note: “*” indicates a required attachment.</p>
      <table className="faq-table ml-12 border-collapse border border-gray-300 w-full ">
        <tbody>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Current State Plan*</td>
            <td className="border border-gray-300 px-4 py-2">
              Current version of the CHIP state plan that details how the State operates its CHIP
              program
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
              Amended State Plan Language*
            </td>
            <td className="border border-gray-300 px-4 py-2">
              Track changes to <span className="underline">only</span> the currently approved CHIP
              state plan pages that the State is proposing to amend
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
            <td className="border border-gray-300 px-4 py-2">
              Cover letter to CMS with an authorized signature that outlines the purpose of the CHIP
              SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
            <td className="border border-gray-300 px-4 py-2">
              Updated 1-year budget if applicable of the State's planned expenditures if the CHIP
              SPA submission has a significant impact on the approved budget
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Public Notice</td>
            <td className="border border-gray-300 px-4 py-2">
              Process used by the State if applicable to accomplish involvement of the public that
              occurred specifically for this CHIP SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
            <td className="border border-gray-300 px-4 py-2">
              Consultation process with Indian Tribes if applicable that occurred specifically for
              this CHIP SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Other</td>
            <td className="border border-gray-300 px-4 py-2">
              Other supporting document(s) needed to process the CHIP SPA submission
            </td>
          </tr>
        </tbody>
      </table>

      <p className="font-bold mt-12">CHIP Eligibility SPA Attachment Types:</p>
      <p className="ml-12">Note: “*” indicates a required attachment.</p>
      <table className="faq-eligibility-table ml-12 border-collapse border border-gray-300 w-full ">
        <tbody>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
              CHIP Eligibility Template*
            </td>
            <td className="border border-gray-300 px-4 py-2">
              Amendment to the eligibility section of the CHIP state plan using a PDF template
              repository, including statutory and regulatory background, required information, and
              minimum review criteria
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
            <td className="border border-gray-300 px-4 py-2">
              Cover letter to CMS with an authorized signature that outlines the purpose of the CHIP
              SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Current State Plan</td>
            <td className="border border-gray-300 px-4 py-2">
              Current version of the CHIP state plan that details how the State operates its CHIP
              program
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
              Amended State Plan Language
            </td>
            <td className="border border-gray-300 px-4 py-2">
              Track changes to <span className="underline">only</span> the currently approved CHIP
              state plan pages that the State is proposing to amend
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
            <td className="border border-gray-300 px-4 py-2">
              Updated 1-year budget if applicable of the State's planned expenditures if the CHIP
              SPA submission has a significant impact on the approved budget
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Public Notice</td>
            <td className="border border-gray-300 px-4 py-2">
              Process used by the State if applicable to accomplish involvement of the public that
              occurred specifically for this CHIP SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
            <td className="border border-gray-300 px-4 py-2">
              Consultation process with Indian Tribes if applicable that occurred specifically for
              this CHIP SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Other</td>
            <td className="border border-gray-300 px-4 py-2">
              Other supporting document(s) needed to process the CHIP Eligibility SPA submission
            </td>
          </tr>
        </tbody>
      </table>
    </>
  ) : (
    <>
      <p>Note: “*” indicates a required attachment.</p>
      <table className="faq-table border-collapse border border-gray-300 w-full ">
        <tbody>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Current State Plan*</td>
            <td className="border border-gray-300 px-4 py-2">
              Current version of the CHIP state plan that details how the State operates its CHIP
              program
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Amended State Plan Language*</td>
            <td className="border border-gray-300 px-4 py-2">
              Redline version of proposed changes to the existing CHIP state plan pages. State to
              provide a redline version and a clean version of the CHIP state plan pages being
              amended.
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
            <td className="border border-gray-300 px-4 py-2">
              Cover letter to CMS with an authorized signature that outlines the purpose of the CHIP
              SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
            <td className="border border-gray-300 px-4 py-2">
              Updated 1-year budget if applicable of the State's planned expenditures if the CHIP
              SPA submission has a significant impact on the approved budget
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Public Notice</td>
            <td className="border border-gray-300 px-4 py-2">
              Process used by the State if applicable to accomplish involvement of the public that
              occurred specifically for this CHIP SPA submission
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
            <td className="border border-gray-300 px-4 py-2">
              Consultation process with Indian Tribes if applicable that occurred specifically for
              this CHIP SPA submission
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
  );

export const spaContent = ({
  isChipSpaDetailsEnabled = false,
  isBannerHidden = false,
}: {
  isChipSpaDetailsEnabled: boolean;
  isBannerHidden: boolean;
}) =>
  [
    {
      anchorText: "spa-admendments",
      question: "Which state plan amendments (SPAs) can I submit in OneMAC?",
      label: "Updated", // Add a `label` field for LD faq
      labelColor: "green",
      answerJSX: (
        <div className="w-full space-y-2">
          <p>
            All Medicaid and CHIP state plan amendments (SPAs), <b>except </b>
            Medicaid SPA submissions processed in the Medicaid & CHIP Program System portal
            (MACPro), must be submitted in OneMac.
          </p>
          <p>
            Starting July 28, 2025 Medicaid Model Data Lab (MMDL) no longer accepts new submissions
            for these SPAs, including:
          </p>
          <ul className="ml-8 list-disc space-y-2">
            <li>Medicaid Alternative Benefit Plan (ABP)</li>
            <li>Medicaid Premiums & Cost Sharing</li>
            <li>CHIP Eligibility</li>
          </ul>
          <p>
            Pending SPAs submitted in MMDL before July 28, 2025 including those on RAI (request for
            additional information) status, will continue to be processed through MMDL.
          </p>
          <p>
            Templates and implementation guides for OneMAC SPAs can be downloaded from the
            respective FAQ:
          </p>
          <ul className="ml-8 list-disc space-y-2 text-blue-600">
            {[
              {
                text: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA templates?",
                href: "#abp-spa-templates",
              },
              {
                text: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?",
                href: "#abp-implementation-guides-spa",
              },
              {
                text: "Where can I download Medicaid Premiums and Cost Sharing SPA templates?",
                href: "#mpc-spa-templates",
              },
              {
                text: "Where can I download Medicaid Premiums and Cost Sharing SPA implementation guides?",
                href: "#mpc-spa-implementation-guides",
              },
              {
                text: "Where can I download CHIP eligibility SPA templates?",
                href: "#chip-spa-templates",
              },
              {
                text: "Where can I download CHIP eligibility SPA implementation guides?",
                href: "#chip-spa-implentation-guides",
              },
            ].map(({ href, text }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById(href.substring(1));
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

                      const buttonElement = targetElement.querySelector("button");
                      if (buttonElement.dataset.state === "closed") {
                        buttonElement.click();
                      }
                    }
                  }}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      anchorText: "spa-id-format",
      question: "What format is used to enter a SPA ID?",
      answerJSX: (
        <div className="space-y-2">
          <p>
            Enter the State Plan Amendment transmittal number. Assign consecutive numbers on a
            calendar year basis (e.g., 20-0001-XXXX, 20-0002-XXXX, etc.).
          </p>
          <p>
            The Official Submission package SPA ID must follow the format SS-YY-#### OR
            SS-YY-####-XXXX to include:
          </p>
          <ul className="list-disc ml-7 space-y-2">
            <li>SS = 2 alpha character (State Abbreviation)</li>
            <li>YY = 2 numeric digits (Year)</li>
            <li>#### = 4 numeric digits (Serial number)</li>
            <li>XXXX = OPTIONAL, 1 to 4 characters alpha/numeric modifier (Suffix)</li>
          </ul>
        </div>
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
              className="text-blue-600 underline hover:no-underline "
              href="https://www.ecfr.gov/cgi-bin/text-idx?SID=7d639b87112e05a57ff40731d647bd05&mc=true&node=se42.4.430_112&rgn=div8"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSupportLinkClick("general")}
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
                    <span>CMS-179 Form*</span>
                  </p>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  CMS-179 template that contains specific information for SPA submission. The
                  CMS-179 template is required for all Alternative Benefit Plan and Premiums and
                  Cost Sharing SPA submissions.
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
                  proposed by SPA, feedback received from PN, and copies of websites- notices, state
                  register notices, or newspaper notices that includes the date notice was posted
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  Standard Funding Questions (SFQs)
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Word document of the funding questions required to be submitted with reimbursement
                  SPAs
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
                  Letter responding to RAI questions, any updated SPA pages, and other documentation
                  requested by CMS in the RAI
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
      label: "Updated", // Add a `label` field for LD faq
      labelColor: "green",
      answerJSX: chipSpaAttachmentsAnswer({ isChipSpaDetailsEnabled }),
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
                  Revision made to the amended state plan language of the CHIP SPA submission. State
                  to provide a redline version and a clean version of the revised amended state plan
                  pages
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Official RAI Response*</td>
                <td className="border border-gray-300 px-4 py-2">
                  Official response to CMS to support RAI inquiries for the CHIP SPA submission
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
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
      anchorText: "formal-request-medicaid-spa",
      question:
        "How do I submit a Formal Request for Additional Information (RAI) Response for a Medicaid SPA?",
      answerJSX: (
        <div className="w-full space-y-2">
          <p>When necessary, states will receive an RAI via email from CMS.</p>
          <ul className="list-disc ml-7 space-y-2">
            <li>The state will respond to the RAI through OneMAC.</li>
            <li>
              A Request for Additional Information (RAI) stops the 90-day clock, is a formal request
              for additional information from CMS.
            </li>
            <li>
              Packages pending an official RAI response from the state will have a Status of{" "}
              <b>RAI Issued.</b>
            </li>
          </ul>
          <p>
            To respond to a Medicaid SPA RAI, select the SPA Tab view from the Package Dashboard.
          </p>
          <ul className="list-disc ml-7 space-y-2">
            <li>
              Select the link to the SPA ID. Packages which are in need of an RAI response from the
              state will have a Status of <b>RAI Issued.</b>
            </li>
            <li>Then, under Package Actions, select the Respond to RAI link.</li>
            <li>
              After attaching any required files, you may include additional notes prior to clicking
              on the submit button.
            </li>
            <li>Check your entries, as you cannot edit the submission after you select Submit.</li>
          </ul>
        </div>
      ),
    },
    {
      anchorText: "withdraw-spa-rai-response",
      question: "How do I Withdraw a Formal RAI Response for a Medicaid SPA?",
      answerJSX: (
        <div className="w-full space-y-2">
          <p>
            If a state wishes to withdraw a Formal RAI Response, the state must first contact their
            CMS Point of Contact so the action can be enabled.
          </p>
          <ul className="list-disc ml-7">
            <li>
              As a CMS user, log in to OneMAC and select the link to the SPA ID from the dashboard
            </li>
            <li>
              Then, under Package Actions, select the Enable Formal RAI Response Withdraw link, and
              then Select Submit.
            </li>
          </ul>
          <p>
            After receiving confirmation from your CMS Point of Contact that the Withdraw Formal RAI
            Response feature has been enabled, locate and select the Medicaid SPA submission
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
          <ul className="list-disc ml-7 space-y-2">
            <li>
              On the Formal RAI Response Withdraw form, upload any supporting documentation and fill
              out the Additional Information section explaining your need to withdraw the Formal RAI
              Response (all required information is marked with an asterisk).
            </li>
            <li>
              Select Submit.
              <ul className="list-disc ml-12">
                <li>
                  You will receive a confirmation message asking if you are sure that you want to
                  withdraw the Formal RAI Response. Select Yes, withdraw response.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      ),
    },
    {
      anchorText: "withdraw-package-spa",
      question: "How do I Withdraw a Package for a Medicaid SPA?",
      answerJSX: (
        <div className="w-full space-y-2">
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
              Alternatively, the Withdraw Package action can be accessed by selecting the three dots
              icon in the Actions column on the Package Dashboard. Then, select Withdraw Package
              from the drop-down list.
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
      anchorText: "formal-request-chip-spa",
      question:
        "How do I submit a Formal Request for Additional Information (RAI) Response for a CHIP SPA?",
      answerJSX: (
        <div className="w-full space-y-2">
          <p>When necessary, states will receive an RAI via email from CMS.</p>
          <ul className="ml-8 list-disc space-y-2">
            <li>The state will respond to the RAI through OneMAC.</li>
            <li>
              A Request for Additional Information (RAI) stops the 90-day clock, is a formal request
              for additional information from CMS.
            </li>
            <li>
              Packages pending an official RAI response from the state will have a Status of{" "}
              <b>RAI Issued.</b>
            </li>
          </ul>
          <p>To respond to a CHIP SPA RAI, select the SPA Tab view from the Package Dashboard.</p>
          <ul className="ml-8 list-disc space-y-2">
            <li>
              Select the link to the SPA ID. Packages which are in need of an RAI response from the
              state will have a Status of <b>RAI Issued.</b>
            </li>
            <li>Then, under Package Actions, select the Respond to RAI link.</li>
            <li>
              After attaching any required files, you may include additional notes prior to clicking
              on the submit button.
            </li>
            <li>Check your entries, as you cannot edit the submission after you select Submit.</li>
          </ul>
        </div>
      ),
    },
    {
      anchorText: "withdraw-chip-spa-rai-response",
      question: "How do I Withdraw a Formal RAI Response for a CHIP SPA?",
      answerJSX: (
        <div className="w-full space-y-2">
          <p>
            If a state wishes to withdraw a Formal RAI Response, the state must first contact their
            CMS Point of Contact so the action can be enabled.
          </p>
          <ul className="list-disc ml-7">
            <li>
              As a CMS user, log in to OneMAC and select the link to the SPA ID from the dashboard
            </li>
            <li>
              Then, under Package Actions, select the Enable Formal RAI Response Withdraw link, and
              then Select Submit.
            </li>
          </ul>
          <p>
            After receiving confirmation from your CMS Point of Contact that the Withdraw Formal RAI
            Response feature has been enabled, locate and select the CHIP SPA submission package.
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
          <ul className="list-disc ml-7 space-y-2">
            <li>
              On the Formal RAI Response Withdraw form, upload any supporting documentation and fill
              out the Additional Information section explaining your need to withdraw the Formal RAI
              Response (all required information is marked with an asterisk).
            </li>
            <li>
              Select Submit.
              <ul className="list-disc ml-12">
                <li>
                  You will receive a confirmation message asking if you are sure that you want to
                  withdraw the Formal RAI Response. Select Yes, withdraw response.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      ),
    },
    {
      anchorText: "withdraw-package-chip-spa",
      question: "How do I Withdraw a Package for a CHIP SPA?",
      answerJSX: (
        <div className="w-full space-y-2">
          <p>
            A state can withdraw a submission package if it is in the Under Review or RAI Issued
            status. However, please note that once withdrawn, a submission package cannot be
            resubmitted to CMS.{" "}
            <b> Completing this action will conclude the review of this SPA package.</b>
          </p>
          <p>There are two methods you can use to withdraw a submission package: </p>
          <ul className="ml-8 list-disc space-y-2">
            <li>
              In OneMAC, Locate and select the link to the CHIP SPA ID. Then, under Package Actions,
              select the Withdraw Package link.
            </li>
            <li>
              Alternatively, the Withdraw Package action can be accessed by selecting the three dots
              icon in the Actions column on the Package Dashboard. Then, select Withdraw Package
              from the drop-down list.
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
      label: "Updated",
      labelColor: "green",
      answerJSX: (
        <section className="space-y-2">
          <p>
            Medicaid Alternative Benefit Plan (ABP) SPA templates can be downloaded at the links
            below. After downloading and completing the templates you need, upload them as part of
            the SPA submission. The template PDFs can only be opened using Adobe Reader or Acrobat.
          </p>
          <PdfList list={ABP_TEMPLATES} label="template" />
        </section>
      ),
    },
    {
      anchorText: "abp-implementation-guides-spa",
      question:
        "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?",
      label: "New",
      labelColor: "blue",
      answerJSX: (
        <section className="space-y-2">
          <p>
            Medicaid Alternative Benefit Plan (ABP) SPA implementation guides can be downloaded at
            the links below.
          </p>
          <PdfList list={ABP_GUIDES} label="template" />
        </section>
      ),
    },
    {
      anchorText: "mpc-spa-templates",
      question: "Where can I download Medicaid Premiums and Cost Sharing SPA templates?",
      label: "New",
      labelColor: "blue",
      answerJSX: (
        <section className="space-y-2">
          <p>
            Medicaid Premiums and Cost Sharing SPA templates can be downloaded at the links below.
            After downloading and completing the templates you need, upload them as part of the SPA
            submission. The template PDFs can only be opened using Adobe Reader or Acrobat.
          </p>
          <PdfList list={MPC_TEMPLATES} label="template" />
        </section>
      ),
    },
    {
      anchorText: "mpc-spa-implementation-guides",
      question:
        "Where can I download Medicaid Premiums and Cost Sharing SPA implementation guides?",
      label: "New",
      labelColor: "blue",
      answerJSX: (
        <section className="space-y-2">
          <p>
            Medicaid Premiums and Cost Sharing SPA implementation guides can be downloaded at the
            links below.
          </p>
          <PdfList list={MPC_GUIDES} label="template" />
        </section>
      ),
    },
    {
      anchorText: "chip-spa-templates",
      question: "Where can I download CHIP eligibility SPA templates?",
      label: "Updated",
      labelColor: "green",
      answerJSX: (
        <section>
          <p>
            CHIP eligibility SPA templates can be downloaded at the links below. After downloading
            and completing the templates you need, upload them as part of the SPA submission. The
            template PDFs can only be opened using Adobe Reader or Acrobat.
          </p>
          <ul className="list-disc pl-7 space-y-2 py-4">
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
              "list-disc pl-7 space-y-2",
            )}
            {renderSection(
              "XXI Medicaid Expansion",
              CHP_TEMPLATES,
              (template) => template.title === "CS 3",
              "list-disc pl-7 space-y-2",
            )}
            {renderSection(
              "Eligibility Processing",
              CHP_TEMPLATES,
              (template) => template.title === "CS 24",
              "list-disc pl-7 space-y-2",
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
                  "CS 31",
                ].includes(template.title),
              "list-disc pl-7 space-y-2",
            )}
          </ul>
        </section>
      ),
    },
    {
      anchorText: "chip-spa-implentation-guides",
      question: "Where can I download CHIP eligibility SPA implementation guides?",
      label: "Updated",
      labelColor: "green",
      answerJSX: (
        <div>
          <section className="space-y-2">
            <p>CHIP eligibility SPA implementation guides can be downloaded at the links below.</p>
            <ul className="list-disc pl-6">
              <li>
                <PdfLink
                  href="/chp/IG_ChipEligibilityIntroduction.pdf"
                  label="template"
                  title="CHIP Eligibility Introduction"
                />
              </li>
            </ul>
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
                "list-disc pl-6 space-y-2",
              )}
              {renderSection(
                "XXI Medicaid Expansion",
                CHP_GUIDES,
                (guide) => guide.title === "CS 3",
                "list-disc pl-6 space-y-2",
              )}
              {renderSection(
                "Eligibility Processing",
                CHP_GUIDES,
                (guide) => guide.title === "CS 24",
                "list-disc pl-6 space-y-2",
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
                    "CS 31",
                  ].includes(guide.title),
                "list-disc pl-6 space-y-2",
              )}
            </ul>
          </section>
        </div>
      ),
    },
  ].filter((qa) => (isBannerHidden ? !anchorsToHide.includes(qa.anchorText) : true));
