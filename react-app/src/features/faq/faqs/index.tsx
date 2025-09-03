import { generalContent } from "./generalFAQ";
import { spaContent } from "./spaFAQ";
import { waiverContent } from "./waiverFAQ";

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

export const oneMACFAQContent = ({
  isChipSpaDetailsEnabled = false,
  isBannerHidden = true,
}: {
  isChipSpaDetailsEnabled: boolean;
  isBannerHidden: boolean;
}): FAQContent[] => [
  {
    sectionTitle: "General",
    qanda: generalContent,
  },
  {
    sectionTitle: "State Plan Amendments (SPAs)",
    qanda: spaContent({ isChipSpaDetailsEnabled, isBannerHidden }),
  },
  {
    sectionTitle: "Waivers",
    qanda: waiverContent,
  },
];
