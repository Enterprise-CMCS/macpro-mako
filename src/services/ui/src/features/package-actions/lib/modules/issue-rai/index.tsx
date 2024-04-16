import { z } from "zod";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import {
  ActionDescription,
  AdditionalInfoSection,
  AttachmentsSection,
  PackageSection,
} from "@/components";

export const defaultIssueRaiSchema = z.object({
  additionalInformation: zAdditionalInfo,
  attachments: z.object({
    formalRaiLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});
export const defaultIssueRaiFields: ReactElement[] = [
  <ActionDescription key={"content-description"}>
    Issuance of a Formal RAI in OneMAC will create a Formal RAI email sent to
    the State. This will also create a section in the package details summary
    for you and the State to have record. Please attach the Formal RAI Letter
    along with any additional information or comments in the provided text box.
    Once you submit this form, a confirmation email is sent to you and to the
    State.
    <strong className="bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionDescription>,
  <PackageSection key={"content-packagedetails"} />,
  <AttachmentsSection
    key={"field-attachments"}
    attachments={[
      {
        name: "formalRaiLetter",
        label: "Formal RAI Letter",
        required: true,
      },
      {
        name: "other",
        label: "Other",
        required: false,
      },
    ]}
    faqLink={""}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={
      "Add anything else that you would like to share with the State."
    }
  />,
];
export const defaultIssueRaiContent: FormContentHydrator = (document) => ({
  title: "Formal RAI Details",
  preSubmitNotice:
    "Once you submit this form, a confirmation email is sent to you and to the State.",
  successBanner: {
    header: "RAI issued",
    body: `The RAI for ${document.id} has been submitted. An email confirmation will be sent to you and the state.`,
  },
});
