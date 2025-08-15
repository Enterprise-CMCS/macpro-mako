import { FILE_TYPES } from "shared-types/uploads";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components";
import { ABP_GUIDES } from "@/features/faq/content/abpGuides";
import { ABP_TEMPLATES } from "@/features/faq/content/abpTemplate";
import { CHP_GUIDES } from "@/features/faq/content/chpGuides";
import { renderSection } from "@/features/faq/content/chpRenderSection";
import { CHP_TEMPLATES } from "@/features/faq/content/chpTemplates";
import { MPC_GUIDES } from "@/features/faq/content/mpcGuides";
import { MPC_TEMPLATES } from "@/features/faq/content/mpcTemplates";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export type QuestionAnswer = {
  anchorText: string;
  question: string | JSX.Element;
  answerJSX: JSX.Element;
  label?: string;
  labelColor?: "green" | "blue" | string;
};

type FAQContent = {
  sectionTitle: string;
  qanda: QuestionAnswer[];
};

export const helpDeskContact = {
  email: "OneMAC_Helpdesk@cms.hhs.gov",
  phone: "(833) 228-2540",
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 40);

export const handleSupportLinkClick = (type: string) => (e: React.MouseEvent<HTMLElement>) => {
  const text = e.currentTarget.textContent?.trim() || "unknown";
  window.gtag("event", `support_click_${type}_${slugify(text)}`, {
    event_category: "Support",
    event_label: text,
  });
};

export const oneMACFAQContent: FAQContent[] = [
  {
    sectionTitle: "General",
    qanda: [
      {
        anchorText: "crosswalk-system",
        question: "Which SPA or waiver packages should I submit in OneMAC?",
        answerJSX: (
          <div className="space-y-2">
            <p>
              OneMAC supports all Medicaid SPAs, except SPAs submitted in MACPro. This includes CHIP
              SPAs, 1915(b) waiver actions, 1915(c) Appendix K waiver amendments, and 1915(b) and
              (c) waiver temporary extension requests.
            </p>
            <p>
              Check which system to submit your state plan in with this crosswalk training document.
            </p>
            <ul>
              <li>
                <a
                  className="text-blue-800 underline hover:no-underline "
                  href="/onboarding/eligibility-crosswalk-paper-based-state-plan-macpro.pdf"
                  download="EligibilityCrosswalkPaperBasedStatePlanMACPro.pdf"
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={handleSupportLinkClick("general")}
                >
                  Crosswalk from Paper-based State Plan to MACPro and MMDL.pdf
                </a>
              </li>
            </ul>
          </div>
        ),
      },
      {
        anchorText: "browsers",
        question: "What browsers can I use to access the system?",
        answerJSX: (
          <p>
            The submission portal works best on Google Chrome (Version 91.0.4472.77 or later) or
            Firefox (Version 89.0 or later). Firefox users may need to adjust their browser settings
            to enable PDFs to download automatically —{" "}
            <a
              href="https://support.mozilla.org/en-US/kb/change-firefox-behavior-when-open-file"
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-800 underline hover:no-underline"
            >
              learn how
            </a>
            .
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
              onClick={() => sendGAEvent("support_contact_email")}
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
          <p>
            Please refer to the State role descriptions that can be found on page 4 of the{" "}
            <a
              className="text-blue-800 underline hover:no-underline"
              href="/onboarding/OneMACStateUserGuide.pdf"
              download="OneMACStateUserGuide.pdf"
              onClick={handleSupportLinkClick("general")}
            >
              OneMAC State User Guide
            </a>
            .
          </p>
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
          <>
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
                    download={`${label}.pdf`}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={handleSupportLinkClick("general")}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="onboarding-videos">
              <h4 className="text-lg font-bold py-2">Upload Subsequent Documentation Overview</h4>
              <p className="pb-3">
                Watch this video for an overview on how to upload subsequent documentation to a
                package under review.
              </p>
              <video
                controls
                onPlay={() =>
                  sendGAEvent("support_video_play", {
                    event_label: "Upload Subsequent Documentation Overview",
                  })
                }
              >
                <source src="/onboarding/UploadSubsequentDocumentationDemo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <Accordion
                type="single"
                collapsible
                onValueChange={() => {
                  const triggerElement = document.getElementById("video-trigger-2");
                  if (!triggerElement) return;
                  const showText = "Show Transcript";
                  const hideText = "Hide Transcript";
                  triggerElement.textContent =
                    triggerElement.textContent.trim() === showText ? hideText : showText;
                }}
              >
                <AccordionItem className="border-none" value="video-2">
                  <AccordionTrigger
                    className="text-lg flex justify-center text-primary py-3 [&>svg]:hidden"
                    id="video-trigger-2"
                    onClick={handleSupportLinkClick("general")}
                  >
                    Show Transcript
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        OneMac has been updated with a new package action called Upload Subsequent
                        Documentation that allows states to submit revised or additional
                        documentation to an under review SPA or waiver submission package.
                      </p>
                      <p>
                        Now, instead of having to email these documents to CMS, you can upload them
                        directly to your submission package in OneMac. The Subsequent Documentation
                        feature is available for submission packages that are in the under review
                        status.
                      </p>
                      <p>
                        The functionality is accessed in the same way as all other package actions
                        in OneMac, either directly from the package dashboard as an option in the
                        Actions column drop-down menu, or from within the submission package itself
                        under the Package Actions section.
                      </p>
                      <p>
                        After selecting the Upload Subsequent Documents package action, you are
                        taken to the Subsequent Documentation Details page. Select the Choose From
                        Folder link for the appropriate document type, or drag and drop a file from
                        your computer to add any additional documents that need to be submitted to
                        CMS. You can submit multiple documents at once, however, at least one
                        attachment is required.
                      </p>
                      <p>
                        Next, fill out the Reason for Subsequent Documentation section explaining
                        why additional documents are being submitted. After all information has been
                        added, select Submit. You will receive a confirmation message indicating
                        that these documents will be added to the submission package and reviewed by
                        CMS. If you are certain you wish to add these documents to the submission
                        package, select Yes Submit.
                      </p>
                      <p>
                        A green banner is shown indicating that the documents have been submitted
                        and CMS reviewers will follow up by email if additional information is
                        needed. Additionally, an email notification will be sent indicating that the
                        action was taken and CMS will be notified.
                      </p>
                      <p>
                        A new Latest Package Activity field was also added to the Package Dashboard
                        and Submission Package Details section. This field will automatically update
                        to reflect when the most recent package action occurred, including when
                        subsequent documentation is submitted.
                      </p>
                      <p>
                        Thank you for watching this overview of the new subsequent documentation
                        package action in OneMac. If you have any questions, please feel free to
                        contact the OneMac Help Desk at{" "}
                        <a className="text-primary" href="mailto:OneMAC_Helpdesk@cms.hhs.gov">
                          OneMAC_Helpdesk@cms.hhs.gov
                        </a>
                        .
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </>
        ),
      },
    ],
  },
  {
    sectionTitle: "State Plan Amendments (SPAs)",
    qanda: [
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
              Starting July 28, 2025 Medicaid Model Data Lab (MMDL) no longer accepts new
              submissions for these SPAs, including:
            </p>
            <ul className="ml-8 list-disc space-y-2">
              <li>Medicaid Alternative Benefit Plan (ABP)</li>
              <li>Medicaid Premiums & Cost Sharing</li>
              <li>CHIP Eligibility</li>
            </ul>
            <p>
              Pending SPAs submitted in MMDL before July 28, 2025 including those on RAI (request
              for additional information) status, will continue to be processed through MMDL.
            </p>
            <p>
              Templates and implementation guides for OneMAC SPAs can be downloaded from the
              respective FAQ:
            </p>
            <ul className="ml-8 list-disc space-y-2 text-blue-600">
              {[
                {
                  href: "#abp-spa-templates",
                  text: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA templates?",
                },
                {
                  href: "#abp-implementation-guides-spa",
                  text: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?",
                },
                {
                  href: "#mpc-spa-templates",
                  text: "Where can I download Medicaid Premiums and Cost Sharing SPA templates?",
                },
                {
                  href: "#mpc-spa-implementation-guides",
                  text: "Where can I download Medicaid Premiums and Cost Sharing SPA implementation guides?",
                },
                {
                  href: "#chip-spa-templates",
                  text: "Where can I download CHIP eligibility SPA templates?",
                },
                {
                  href: "#chip-spa-implentation-guides",
                  text: "Where can I download CHIP eligibility SPA implementation guides?",
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
                className="text-blue-800 underline hover:no-underline "
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
                  <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Updated 1-year budget if applicable of the State's planned expenditures if the
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
                A Request for Additional Information (RAI) stops the 90-day clock, is a formal
                request for additional information from CMS.
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
                Select the link to the SPA ID. Packages which are in need of an RAI response from
                the state will have a Status of <b>RAI Issued.</b>
              </li>
              <li>Then, under Package Actions, select the Respond to RAI link.</li>
              <li>
                After attaching any required files, you may include additional notes prior to
                clicking on the submit button.
              </li>
              <li>
                Check your entries, as you cannot edit the submission after you select Submit.
              </li>
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
              If a state wishes to withdraw a Formal RAI Response, the state must first contact
              their CMS Point of Contact so the action can be enabled.
            </p>
            <ul className="list-disc ml-7">
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
            <ul className="list-disc ml-7 space-y-2">
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
        anchorText: "formal-request-chip-spa",
        question:
          "How do I submit a Formal Request for Additional Information (RAI) Response for a CHIP SPA?",
        answerJSX: (
          <div className="w-full space-y-2">
            <p>When necessary, states will receive an RAI via email from CMS.</p>
            <ul className="ml-8 list-disc space-y-2">
              <li>The state will respond to the RAI through OneMAC.</li>
              <li>
                A Request for Additional Information (RAI) stops the 90-day clock, is a formal
                request for additional information from CMS.
              </li>
              <li>
                Packages pending an official RAI response from the state will have a Status of{" "}
                <b>RAI Issued.</b>
              </li>
            </ul>
            <p>To respond to a CHIP SPA RAI, select the SPA Tab view from the Package Dashboard.</p>
            <ul className="ml-8 list-disc space-y-2">
              <li>
                Select the link to the SPA ID. Packages which are in need of an RAI response from
                the state will have a Status of <b>RAI Issued.</b>
              </li>
              <li>Then, under Package Actions, select the Respond to RAI link.</li>
              <li>
                After attaching any required files, you may include additional notes prior to
                clicking on the submit button.
              </li>
              <li>
                Check your entries, as you cannot edit the submission after you select Submit.
              </li>
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
              If a state wishes to withdraw a Formal RAI Response, the state must first contact
              their CMS Point of Contact so the action can be enabled.
            </p>
            <ul className="list-disc ml-7">
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
            <ul className="list-disc ml-7 space-y-2">
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
        label: "New",
        labelColor: "blue",
        answerJSX: (
          <section className="space-y-2">
            <p>
              Medicaid Alternative Benefit Plan (ABP) SPA templates can be downloaded at the links
              below. After downloading and completing the templates you need, upload them as part of
              the SPA submission.
            </p>
            <ul className="list-disc pl-7 space-y-2">
              {ABP_TEMPLATES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    download={pdf.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                    onClick={handleSupportLinkClick("template")}
                  >
                    {pdf.title}
                    {pdf.text && `: ${pdf.text}`}
                  </a>
                  {pdf.subtext && (
                    <ul className="list-disc pl-7 space-y-1">
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
        label: "New",
        labelColor: "blue",
        answerJSX: (
          <section className="space-y-2">
            <p>
              Medicaid Alternative Benefit Plan (ABP) SPA implementation guides can be downloaded at
              the links below.
            </p>
            <ul className="list-disc pl-7 space-y-2">
              {ABP_GUIDES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    download={pdf.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                    onClick={handleSupportLinkClick("template")}
                  >
                    {pdf.title}
                    {pdf.text && `: ${pdf.text}`}
                  </a>
                </li>
              ))}
            </ul>
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
              After downloading and completing the templates you need, upload them as part of the
              SPA submission.
            </p>
            <ul className="list-disc pl-7 space-y-2">
              {MPC_TEMPLATES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    download={pdf.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                    onClick={handleSupportLinkClick("template")}
                  >
                    {pdf.title}
                    {pdf.text && `: ${pdf.text}`}
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
          "Where can I download Medicaid Premiums and Cost Sharing SPA implementation guides?",
        label: "New",
        labelColor: "blue",
        answerJSX: (
          <section className="space-y-2">
            <p>
              Medicaid Premiums and Cost Sharing SPA implementation guides can be downloaded at the
              links below.
            </p>
            <ul className="list-disc pl-7 space-y-2">
              {MPC_GUIDES.map((pdf) => (
                <li key={pdf.title}>
                  <a
                    href={pdf.href}
                    download={pdf.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                    onClick={handleSupportLinkClick("template")}
                  >
                    {pdf.title}
                    {pdf.text && `: ${pdf.text}`}
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
        label: "New",
        labelColor: "blue",
        answerJSX: (
          <section>
            <p>
              CHIP eligibility SPA templates can be downloaded at the links below. After downloading
              and completing the templates you need, upload them as part of the SPA submission.
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
        label: "New",
        labelColor: "blue",
        answerJSX: (
          <div>
            <section className="space-y-2">
              <p>
                CHIP eligibility SPA implementation guides can be downloaded at the links below.
              </p>
              <ul className="list-disc pl-6">
                <li>
                  <a
                    href="/chp/IG_ChipEligibilityIntroduction.pdf"
                    download="IG_ChipEligibilityIntroduction.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                    onClick={handleSupportLinkClick("template")}
                  >
                    CHIP Eligibility Introduction
                  </a>
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
                    ].includes(guide.title),
                  "list-disc pl-6 space-y-2",
                )}
              </ul>
            </section>
          </div>
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
          <div className="space-y-2">
            <p>
              1915(b) Initial Waiver numbers must follow the format SS-####.R00.00 or
              SS-#####.R00.00 to include:
            </p>
            <ul className="list-disc pl-7 space-y-2">
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
          </div>
        ),
      },
      {
        anchorText: "waiver-renewal-id-format",
        question: "What format is used to enter a 1915(b) Waiver Renewal number?",
        answerJSX: (
          <div className="space-y-2">
            <p>
              1915(b) Waiver Renewal must follow the format SS-####.R##.00 or SS-#####.R##.00 to
              include:
            </p>
            <ul className="list-disc pl-7 space-y-2">
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
          </div>
        ),
      },
      {
        anchorText: "waiver-amendment-id-format",
        question: "What format is used to enter a 1915(b) Waiver Amendment number?",
        answerJSX: (
          <div className="space-y-2">
            <p>
              1915(b) Waiver Amendment must follow the format SS-####.R##.## or SS-#####.R##.## to
              include:
            </p>
            <ul className="list-disc pl-7 space-y-2">
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
          </div>
        ),
      },
      {
        anchorText: "waiver-id-help",
        question: "Who can I contact to help me figure out the correct 1915(b) Waiver Number?",
        answerJSX: (
          <p>
            Email{" "}
            <a
              className="text-blue-800 "
              href="mailto:MCOGDMCOActions@cms.hhs.gov"
              onClick={handleSupportLinkClick("general")}
            >
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
          <div className="space-y-2">
            <p>
              Waiver number must follow the format SS-####.R##.## or SS-#####.R##.## to include:
            </p>
            <ul className="list-disc pl-7 space-y-2">
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
          </div>
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
                  <td className="border border-gray-300 px-4 py-2">Waiver RAI Response Letter*</td>
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
          <div className="space-y-2">
            <p>
              Temporary extension numbers must follow the format SS-####.R##.TE## or
              SS-#####.R##.TE## to include:
            </p>
            <ul className="list-disc pl-7 space-y-2">
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
          </div>
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
        anchorText: "formal-request-waiver",
        question:
          "How do I submit a Formal Request for Additional Information (RAI) Response for a Waiver?",
        answerJSX: (
          <div className="w-full space-y-2">
            <p>When necessary, states will receive an RAI via email from CMS.</p>
            <ul className="ml-8 list-disc space-y-2">
              <li>The state will respond to the RAI through OneMAC.</li>
              <li>
                A Request for Additional Information (RAI) stops the 90-day clock, is a formal
                request for additional information from CMS.
              </li>
              <li>
                Packages pending an official RAI response from the state will have a Status of{" "}
                <b>RAI Issued.</b>
              </li>
            </ul>
            <p>
              To respond to a Waiver RAI, select the Waiver Tab view from the Package Dashboard.
            </p>
            <ul className="ml-8 list-disc space-y-2">
              <li>
                Select the link to the Waiver ID. Packages which are in need of an RAI response from
                the state will have a Status of <b>RAI Issued.</b>
              </li>
              <li>Then, under Package Actions, select the Respond to RAI link.</li>
              <li>
                After attaching any required files, you may include additional notes prior to
                clicking on the submit button.
              </li>
              <li>
                Check your entries, as you cannot edit the submission after you select Submit.
              </li>
            </ul>
          </div>
        ),
      },
      {
        anchorText: "withdraw-waiver-rai-response",
        question: "How do I Withdraw a Formal RAI Response for a Medicaid Waiver?",
        answerJSX: (
          <div className="w-full space-y-2">
            <p>
              If a state wishes to withdraw a Formal RAI Response, the state must first contact
              their CMS Point of Contact so the action can be enabled.
            </p>
            <ul className="list-disc ml-7">
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
            <ul className="list-disc ml-7 space-y-2">
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
          <div className="w-full space-y-2">
            <p>
              A state can withdraw a submission package if it is in the Under Review or RAI Issued
              status. However, please note that once withdrawn, a submission package cannot be
              resubmitted to CMS.{" "}
              <b>Completing this action will conclude the review of this Waiver package.</b>
            </p>
            <p>There are two methods you can use to withdraw a submission package:</p>
            <ul className="list-disc ml-7 space-y-2">
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
