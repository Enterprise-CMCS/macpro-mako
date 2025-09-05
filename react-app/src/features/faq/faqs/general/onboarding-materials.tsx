import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { handleSupportLinkClick, PdfList, Template } from "../utils";

export const ONBOARDING_GUIDES: Template[] = [
  {
    title: "Welcome to OneMAC",
    href: "/onboarding/WelcometoOneMAC.pdf",
  },
  {
    title: "IDM Instructions for OneMAC Users",
    href: "/onboarding/IDMInstructionsforOneMACUsers.pdf",
  },
  {
    title: "OneMAC IDM Guide",
    href: "/onboarding/OneMACIDMGuide.pdf",
  },
  {
    title: "OneMAC State User Guide",
    href: "/onboarding/OneMACStateUserGuide.pdf",
  },
  {
    title: "OneMAC CMS User Guide",
    href: "/onboarding/OneMACCMSUserGuide.pdf",
  },
];

export const OnboardingMaterials = () => (
  <>
    <PdfList list={ONBOARDING_GUIDES} label="general" ulClassName="" />
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
                Documentation that allows states to submit revised or additional documentation to an
                under review SPA or waiver submission package.
              </p>
              <p>
                Now, instead of having to email these documents to CMS, you can upload them directly
                to your submission package in OneMac. The Subsequent Documentation feature is
                available for submission packages that are in the under review status.
              </p>
              <p>
                The functionality is accessed in the same way as all other package actions in
                OneMac, either directly from the package dashboard as an option in the Actions
                column drop-down menu, or from within the submission package itself under the
                Package Actions section.
              </p>
              <p>
                After selecting the Upload Subsequent Documents package action, you are taken to the
                Subsequent Documentation Details page. Select the Choose From Folder link for the
                appropriate document type, or drag and drop a file from your computer to add any
                additional documents that need to be submitted to CMS. You can submit multiple
                documents at once, however, at least one attachment is required.
              </p>
              <p>
                Next, fill out the Reason for Subsequent Documentation section explaining why
                additional documents are being submitted. After all information has been added,
                select Submit. You will receive a confirmation message indicating that these
                documents will be added to the submission package and reviewed by CMS. If you are
                certain you wish to add these documents to the submission package, select Yes
                Submit.
              </p>
              <p>
                A green banner is shown indicating that the documents have been submitted and CMS
                reviewers will follow up by email if additional information is needed. Additionally,
                an email notification will be sent indicating that the action was taken and CMS will
                be notified.
              </p>
              <p>
                A new Latest Package Activity field was also added to the Package Dashboard and
                Submission Package Details section. This field will automatically update to reflect
                when the most recent package action occurred, including when subsequent
                documentation is submitted.
              </p>
              <p>
                Thank you for watching this overview of the new subsequent documentation package
                action in OneMac. If you have any questions, please feel free to contact the OneMac
                Help Desk at{" "}
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
);
