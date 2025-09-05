import { AcceptableFileFormats } from "./acceptable-file-formats";
import { Browsers } from "./browsers";
import { ConfirmEmail } from "./confirm-email";
import { CrosswalkSystem } from "./crosswalk-system";
import { IsOfficial } from "./is-official";
import { OnboardingMaterials } from "./onboarding-materials";
import { OneMacRoles } from "./onemac-roles";

export const generalContent = [
  {
    anchorText: "crosswalk-system",
    question: "Which SPA or waiver packages should I submit in OneMAC?",
    answerJSX: <CrosswalkSystem />,
  },
  {
    anchorText: "browsers",
    label: "Updated",
    labelColor: "green",
    question: "What browsers can I use to access the system?",
    answerJSX: <Browsers />,
  },
  {
    anchorText: "confirm-email",
    question: "What should we do if we don’t receive a confirmation email?",
    answerJSX: <ConfirmEmail />,
  },
  {
    anchorText: "is-official",
    question: "Is this considered the official state submission?",
    answerJSX: <IsOfficial />,
  },
  {
    anchorText: "onemac-roles",
    question: "What are the OneMAC State user roles?",
    answerJSX: <OneMacRoles />,
  },
  {
    anchorText: "acceptable-file-formats",
    question: "What are the kinds of file formats I can upload into OneMAC",
    answerJSX: <AcceptableFileFormats />,
  },
  {
    anchorText: "onboarding-materials",
    question: "Onboarding Materials",
    answerJSX: <OnboardingMaterials />,
  },
];
