import { FILE_TYPES } from "shared-types/uploads";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { ONBOARDING_GUIDES } from "../content/onboardingGuides";
import { handleSupportLinkClick, helpDeskContact, PdfLink, PdfList } from "./utils";

export const generalContent = [
  {
    anchorText: "crosswalk-system",
    question: "Which SPA or waiver packages should I submit in OneMAC?",
    answerJSX: (
      <div className="space-y-2">
        <p>
          OneMAC supports all Medicaid SPAs, except SPAs submitted in MACPro. This includes CHIP
          SPAs, 1915(b) waiver actions, 1915(c) Appendix K waiver amendments, and 1915(b) and (c)
          waiver temporary extension requests.
        </p>
        <p>
          Check which system to submit your state plan in with this crosswalk training document.
        </p>
        <ul>
          <li>
            <PdfLink
              href="/onboarding/eligibility-crosswalk-paper-based-state-plan-macpro.pdf"
              title="Crosswalk from Paper-based State Plan to MACPro and MMDL.pdf"
              label="general"
            />
          </li>
        </ul>
      </div>
    ),
  },
  {
    anchorText: "browsers",
    label: "Updated",
    labelColor: "green",
    question: "What browsers can I use to access the system?",
    answerJSX: (
      <p>
        The submission portal works best on Google Chrome (Version 91.0.4472.77 or later) or Firefox
        (Version 89.0 or later). Firefox users may need to adjust their browser settings to enable
        PDFs to download automatically —{" "}
        <a
          href="https://support.mozilla.org/en-US/kb/change-firefox-behavior-when-open-file"
          rel="noopener noreferrer"
          target="_blank"
          className="text-blue-600 underline hover:no-underline"
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
          className="text-blue-600 underline hover:no-underline"
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
        considered your official state submission and will only be considered received by CMS if you
        have received the electronic receipt. You should receive an email confirmation that the
        formal action was received along with information about the 90th day. If you do not receive
        a confirmation email for your SPA or waiver submissions, please contact your state lead or
        your state’s CMS lead for HCBS or managed care.
      </p>
    ),
  },
  {
    anchorText: "onemac-roles",
    question: "What are the OneMAC State user roles?",
    answerJSX: (
      <p>
        Please refer to the State role descriptions that can be found on page 4 of the{" "}
        <PdfLink
          href="/onboarding/OneMACStateUserGuide.pdf"
          label="general"
          title="OneMAC State User Guide"
        />
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
                <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">{extension}</td>
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
        <PdfList list={ONBOARDING_GUIDES} label="general" />
        <div className="onboarding-videos">
          <h4 className="text-lg font-bold py-2">Upload Subsequent Documentation Overview</h4>
          <p className="pb-3">
            Watch this video for an overview on how to upload subsequent documentation to a package
            under review.
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
                    Documentation that allows states to submit revised or additional documentation
                    to an under review SPA or waiver submission package.
                  </p>
                  <p>
                    Now, instead of having to email these documents to CMS, you can upload them
                    directly to your submission package in OneMac. The Subsequent Documentation
                    feature is available for submission packages that are in the under review
                    status.
                  </p>
                  <p>
                    The functionality is accessed in the same way as all other package actions in
                    OneMac, either directly from the package dashboard as an option in the Actions
                    column drop-down menu, or from within the submission package itself under the
                    Package Actions section.
                  </p>
                  <p>
                    After selecting the Upload Subsequent Documents package action, you are taken to
                    the Subsequent Documentation Details page. Select the Choose From Folder link
                    for the appropriate document type, or drag and drop a file from your computer to
                    add any additional documents that need to be submitted to CMS. You can submit
                    multiple documents at once, however, at least one attachment is required.
                  </p>
                  <p>
                    Next, fill out the Reason for Subsequent Documentation section explaining why
                    additional documents are being submitted. After all information has been added,
                    select Submit. You will receive a confirmation message indicating that these
                    documents will be added to the submission package and reviewed by CMS. If you
                    are certain you wish to add these documents to the submission package, select
                    Yes Submit.
                  </p>
                  <p>
                    A green banner is shown indicating that the documents have been submitted and
                    CMS reviewers will follow up by email if additional information is needed.
                    Additionally, an email notification will be sent indicating that the action was
                    taken and CMS will be notified.
                  </p>
                  <p>
                    A new Latest Package Activity field was also added to the Package Dashboard and
                    Submission Package Details section. This field will automatically update to
                    reflect when the most recent package action occurred, including when subsequent
                    documentation is submitted.
                  </p>
                  <p>
                    Thank you for watching this overview of the new subsequent documentation package
                    action in OneMac. If you have any questions, please feel free to contact the
                    OneMac Help Desk at{" "}
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
];
