import { Link } from "react-router-dom";
import { FAQ_TARGET } from "@/routes";

export const FormIntroText = () => (
  <p className="font-light  max-w-4xl">
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.{" "}
    <strong className="bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </p>
);

export const SpaIdFormattingDesc = () => (
  <>
    <p className="text-gray-500 font-light">
      Must follow the format SS-YY-NNNN or SS-YY-NNNN-XXXX.
    </p>
    <p className="italic text-gray-500 font-light">
      Reminder - CMS recommends that all SPA numbers start with the year in
      which the package is submitted.
    </p>
  </>
);

export const AttachmentsSizeTypesDesc = ({
  faqLink,
  includeCMS179 = false,
}: {
  faqLink: string;
  includeCMS179?: boolean;
}) => (
  <>
    <p>
      Maximum file size of 80 MB per attachment.{" "}
      <strong>
        You can add multiple files per attachment type
        {includeCMS179 && ", except for the CMS Form 179."}.
      </strong>{" "}
      Read the description for each of the attachment types on the{" "}
      {
        <Link
          to={faqLink}
          target={FAQ_TARGET}
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline"
        >
          FAQ Page
        </Link>
      }
      .
    </p>
    <p>
      We accept the following file formats:{" "}
      <strong className="bold">.docx, .jpg, .png, .pdf, .xlsx,</strong> and a
      few others. See the full list on the{" "}
      {
        <Link
          to="/faq/#acceptable-file-formats"
          target={FAQ_TARGET}
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline"
        >
          FAQ Page
        </Link>
      }
      .
    </p>
  </>
);

export const PreSubmissionMessage = () => (
  <div className="my-2 w-5/6">
    <i>
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email. If you leave this page, you will lose your progress on
      this form.
    </i>
  </div>
);
