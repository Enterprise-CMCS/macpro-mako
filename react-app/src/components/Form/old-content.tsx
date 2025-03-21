import { Info } from "lucide-react";

import {
  ActionFormDescription,
  Alert,
  ProgressLossReminder,
  RequiredFieldDescription,
} from "@/components";

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
