import {
  ActionFormDescription,
  Alert,
  ProgressLossReminder,
  RequiredFieldDescription,
} from "@/components";
import { FAQ_TAB } from "@/router";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";

type FormIntroTextProps = {
  hasProgressLossReminder?: boolean;
};

export const FormIntroText = ({ hasProgressLossReminder = true }: FormIntroTextProps) => (
  <div>
    <RequiredFieldDescription />
    <ActionFormDescription boldReminder={hasProgressLossReminder}>
      Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this
      content to review your package, and you will not be able to edit this form. If CMS needs any
      additional information, they will follow up by email.{" "}
    </ActionFormDescription>
  </div>
);

export const FormIntroTextForAppK = () => (
  <div>
    <FormIntroText />
    <p className="max-w-4xl mt-4 text-gray-700 font-light">
      <span className="font-bold">
        If your Appendix K submission is for more than one waiver number, please enter one of the
        applicable waiver numbers. You do not need to create multiple submissions.
      </span>
    </p>
  </div>
);

export const SpaIdFormattingDesc = () => (
  <>
    <p>Must follow the format SS-YY-NNNN or SS-YY-NNNN-XXXX.</p>
    <p className="text-neutral-500">
      Reminder - CMS recommends that all SPA numbers start with the year in which the package is
      submitted.
    </p>
  </>
);

export const AttachmentsSizeTypesDesc = ({
  faqAttLink,
  includeCMS179 = false,
}: {
  faqAttLink: string;
  includeCMS179?: boolean;
}) => (
  <div className="text-gray-700 font-light">
    <p>
      Maximum file size of 80 MB per attachment.{" "}
      <span className="font-bold">
        You can add multiple files per attachment type
        {includeCMS179 && ", except for the CMS Form 179."}.
      </span>{" "}
      Read the description for each of the attachment types on the{" "}
      {
        <Link
          to={faqAttLink}
          target={FAQ_TAB}
          rel="noopener noreferrer"
          className="text-blue-900 underline"
        >
          FAQ Page
        </Link>
      }
      .
    </p>
    <br />
    <p>
      We accept the following file formats:{" "}
      <strong className="bold">.doc, .docx, .pdf, .jpg, .xlsx, and more. </strong>{" "}
      {
        <Link
          to={"/faq/acceptable-file-formats"}
          target={FAQ_TAB}
          rel="noopener noreferrer"
          className="text-blue-900 underline"
        >
          See the full list
        </Link>
      }
      .
    </p>
  </div>
);

type PreSubmissionMessageProps = {
  hasProgressLossReminder?: boolean;
  preSubmissionMessage?: string;
};
export const PreSubmissionMessage = ({
  hasProgressLossReminder = true,
  preSubmissionMessage = `Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.`,
}: PreSubmissionMessageProps) => (
  <Alert variant="infoBlock" className="my-2 flex-row text-sm">
    <Info />
    <p className="ml-2">{preSubmissionMessage}</p>
    {hasProgressLossReminder && <ProgressLossReminder className="ml-2" />}
  </Alert>
);
