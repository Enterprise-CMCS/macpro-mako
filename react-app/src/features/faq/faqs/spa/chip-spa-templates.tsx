import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { PdfList, Template } from "../utils";

// MAGI Eligibility & Methods
export const CHP_MAGI_TEMPLATES: Template[] = [
  {
    title: "CS 7",
    text: "Eligibility - Targeted Low-Income Children",
    href: "/chp/CS7.pdf",
  },
  {
    title: "CS 8",
    text: "Eligibility - Targeted Low-Income Pregnant Women",
    href: "/chp/CS8.pdf",
  },
  {
    title: "CS 9",
    text: "Eligibility - Coverage From Conception to Birth",
    href: "/chp/CS9.pdf",
  },
  {
    title: "CS 10",
    text: "Eligibility - Children Who Have Access to Public Employee Coverage",
    href: "/chp/CS10.pdf",
  },
  {
    title: "CS 11",
    text: "Eligibility - Pregnant Women Who Have Access to Public Employee Coverage",
    href: "/chp/CS11.pdf",
  },
  {
    title: "CS 12",
    text: "Eligibility - Dental Only Supplemental Coverage",
    href: "/chp/CS12.pdf",
  },
  {
    title: "CS 13",
    text: "Eligibility - Deemed Newborns",
    href: "/chp/CS13.pdf",
  },
  {
    title: "CS 15",
    text: "MAGI-Based Income Methodologies",
    href: "/chp/CS15.pdf",
  },
  {
    title: "CS 16",
    text: "Other Eligibility Criteria - Spenddowns",
    href: "/chp/CS16.pdf",
  },
];

// XXI Medicaid Expansion
export const CHP_MED_EXPANSION_TEMPLATES: Template[] = [
  {
    title: "CS 3",
    text: "Eligibility for Medicaid Expansion Program",
    href: "/chp/CS3.pdf",
  },
];

// Eligibility Processing
export const CHP_ELIGIBILITY_TEMPLATE: Template[] = [
  {
    title: "CS 24",
    text: "General Eligibility - Eligibility Processing",
    href: "/chp/CS24.pdf",
  },
];

// Non-Financial Eligibility
export const CHP_NON_FIN_TEMPLATE: Template[] = [
  {
    title: "CS 17",
    text: "Non-Financial Eligibility - Residency",
    href: "/chp/CS17.pdf",
  },
  {
    title: "CS 18",
    text: "Non-Financial Eligibility - Citizenship",
    href: "/chp/CS18.pdf",
  },
  {
    title: "CS 19",
    text: "Non-Financial Eligibility - Social Security Number",
    href: "/chp/CS19.pdf",
  },
  {
    title: "CS 20",
    text: "Non-Financial Eligibility - Substitution of Coverage",
    href: "/chp/CS20.pdf",
  },
  {
    title: "CS 21",
    text: "Non-Financial Eligibility - Non-Payment of Premiums",
    href: "/chp/CS21.pdf",
  },
  {
    title: "CS 23",
    text: "Non-Financial Requirements - Other Eligibility Standards",
    href: "/chp/CS23.pdf",
  },
  {
    title: "CS 27",
    text: "General Eligibility - Continuous Eligibility",
    href: "/chp/CS27.pdf",
  },
  {
    title: "CS 28",
    text: "General Eligibility - Presumptive Eligibility for Children",
    href: "/chp/CS28.pdf",
  },
  {
    title: "CS 29",
    text: "General Eligibility - Presumptive Eligibility for Pregnant Women",
    href: "/chp/CS29.pdf",
  },
  {
    title: "CS 31",
    text: "Incarcerated CHIP Beneficiaries",
    href: "/chp/CS31-A.pdf",
    downloadName: "CS31.pdf",
  },
];

export const ChipSpaTemplates = () => {
  const useNewCs31 = useFeatureFlag("CS31_ALT");

  const nonFinancialTemplates: Template[] = CHP_NON_FIN_TEMPLATE.map((template) =>
    template.title === "CS 31"
      ? { ...template, href: useNewCs31 ? "/chp/CS31-B.pdf" : "/chp/CS31-A.pdf" }
      : template,
  );

  return (
    <section>
      <p>
        CHIP eligibility SPA templates can be downloaded at the links below. After downloading and
        completing the templates you need, upload them as part of the SPA submission. The template
        PDFs can only be opened using Adobe Reader or Acrobat.
      </p>
      <ul className="pl-7 space-y-2 py-4" role="list">
        <li className="space-y-2">
          <p>MAGI Eligibility & Methods</p>
          <PdfList
            list={CHP_MAGI_TEMPLATES}
            label="template"
            ulClassName="list-disc pl-7 space-y-2"
          />
        </li>
        <li className="space-y-2">
          <p>XXI Medicaid Expansion</p>
          <PdfList
            list={CHP_MED_EXPANSION_TEMPLATES}
            label="template"
            ulClassName="list-disc pl-7 space-y-2"
          />
        </li>
        <li className="space-y-2">
          <p>Eligibility Processing</p>
          <PdfList
            list={CHP_ELIGIBILITY_TEMPLATE}
            label="template"
            ulClassName="list-disc pl-7 space-y-2"
          />
        </li>
        <li className="space-y-2">
          <p>Non-Financial Eligibility</p>
          <PdfList
            list={nonFinancialTemplates}
            label="template"
            ulClassName="list-disc pl-7 space-y-2"
          />
        </li>
      </ul>
    </section>
  );
};
