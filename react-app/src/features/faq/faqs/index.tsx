import { generalContent } from "./general";
import { spaContent } from "./spa";
import { waiverContent } from "./waiver";

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

export const oneMACFAQContent: FAQContent[] = [
  {
    sectionTitle: "General",
    qanda: generalContent,
  },
  {
    sectionTitle: "State Plan Amendments (SPAs)",
    qanda: spaContent,
  },
  {
    sectionTitle: "Waivers",
    qanda: waiverContent,
  },
];
