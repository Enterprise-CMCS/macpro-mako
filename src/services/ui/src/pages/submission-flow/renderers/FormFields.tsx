import { RequiredIndicator } from "@/components/Inputs";

export const FormIntro = () => (
  <p className="my-3">
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.{" "}
    <b>If you leave this page, you will lose your progress on this form.</b>
  </p>
);

export const SpaIDIntro = () => (
  <p id="desc-spa-id" className="text-gray-500 font-light">
    Must follow the format SS-YY-NNNN or SS-YY-NNNN-xxxx.
    <br />
    <em>
      Reminder - CMS recommends that all SPA numbers start with the year in
      which the package is submitted.
    </em>
  </p>
);

export const SpaIDInput = () => (
  <input
    type="text"
    id="input-spa-id"
    name="input-spa-id"
    aria-describedby="desc-spa-id"
    className="border-[1.5px] border-gray-400 rounded-sm h-8 w-[250px] mt-4 p-1"
    required
  />
);

export const AttachmentsIntro = () => (
  <>
    <p className="mt-1 mb-4">
      Maximum file size of 80 MB per attachment. You can add multiple files per
      attachment type. Read the description for each of the attachment types on
      the FAQ Page.
    </p>
    <p className="my-4">
      We accept the following file formats:{" "}
      <b>.docx, .jpg, .pdf, .png, .xlsx</b>. See the full list on the FAQ Page.
    </p>
    <p className="my-4">
      <RequiredIndicator /> At least one attachment is required.
    </p>
  </>
);

export const AdditionalInfoIntro = () => (
  <p className="text-gray-500 font-light mt-1">
    Add anything else that you would like to share with CMS.
  </p>
);

export const AdditionalInfoInput = () => (
  <textarea
    aria-invalid="false"
    aria-describedby="character-count"
    className="border-[1.5px] border-gray-400 rounded-sm w-full h-[200px] mt-4"
    name="additionalInformation"
    maxLength={4000}
    aria-live="off"
    aria-multiline="true"
    id="additional-information"
  />
);
