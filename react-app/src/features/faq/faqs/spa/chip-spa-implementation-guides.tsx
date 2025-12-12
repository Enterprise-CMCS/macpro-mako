import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { PdfLink, PdfList, Template } from "../utils";

// MAGI Eligibility & Methods
export const CHP_MAGI_GUIDES: Template[] = [
  {
    title: "CS 7",
    text: "Eligibility - Targeted Low-Income Children Implementation Guide",
    href: "/chp/IG_CS7_TargetedLow-IncomeChildren.pdf",
  },
  {
    title: "CS 8",
    text: "Eligibility - Targeted Low-Income Pregnant Women Implementation Guide",
    href: "/chp/IG_CS8_TargetedLow-IncomePregnantWomen.pdf",
  },
  {
    title: "CS 9",
    text: "Eligibility - Coverage From Conception to Birth Implementation Guide",
    href: "/chp/IG_CS9_CoverageFromConceptionToBirth.pdf",
  },
  {
    title: "CS 10",
    text: "Eligibility - Children Who Have Access to Public Employee Coverage Implementation Guide",
    href: "/chp/IG_CS10_ChildrenWhoHaveAccessToPublicEmployeeCoverage.pdf",
  },
  {
    title: "CS 11",
    text: "Eligibility - Pregnant Women Who Have Access to Public Employee Coverage Implementation Guide",
    href: "/chp/IG_CS11_PregnantWomenWhoHaveAccessToPublicEmployeeCoverage.pdf",
  },
  {
    title: "CS 12",
    text: "Eligibility - Dental Only Supplemental Coverage Implementation Guide",
    href: "/chp/IG_CS12_DentalOnlySupplementalCoverage.pdf",
  },
  {
    title: "CS 13",
    text: "Eligibility - Deemed Newborns Implementation Guide",
    href: "/chp/IG_CS13_DeemedNewborns.pdf",
  },
  {
    title: "CS 15",
    text: "MAGI-Based Income Methodologies Implementation Guide",
    href: "/chp/IG_CS15_MAGI-BasedIncomeMethodologies.pdf",
  },
  {
    title: "CS 16",
    text: "Other Eligibility Criteria - Spenddowns Implementation Guide",
    href: "/chp/IG_CS16_Spenddown.pdf",
  },
];

// XXI Medicaid Expansion
export const CHP_MED_EXPANSION_GUIDES: Template[] = [
  {
    title: "CS 3",
    text: "Eligibility for Medicaid Expansion Program Implementation Guide",
    href: "/chp/IG_CS3_MedicaidExpansion.pdf",
  },
];

// Eligibility Processing
export const CHP_ELIGIBILITY_GUIDES: Template[] = [
  {
    title: "CS 24",
    text: "General Eligibility - Eligibility Processing Implementation Guide",
    href: "/chp/IG_CS24_EligibilityProcessing.pdf",
  },
];

// Non-Financial Eligibility
export const CHP_NON_FIN_GUIDES: Template[] = [
  {
    title: "CS 17",
    text: "Non-Financial Eligibility - Residency Implementation Guide",
    href: "/chp/IG_CS17_Non-Financial-Residency.pdf",
  },
  {
    title: "CS 18",
    text: "Non-Financial Eligibility - Citizenship Implementation Guide",
    href: "/chp/IG_CS18_Non-Financial-Citizenship.pdf",
  },
  {
    title: "CS 19",
    text: "Non-Financial Eligibility - Social Security Number Implementation Guide",
    href: "/chp/IG_CS19_Non-Financial-SocialSecurityNumber.pdf",
  },
  {
    title: "CS 20",
    text: "Non-Financial Eligibility - Substitution of Coverage Implementation Guide",
    href: "/chp/IG_CS20_Non-Financial-SubstitutionOfCoverage.pdf",
  },
  {
    title: "CS 21",
    text: "Non-Financial Eligibility - Non-Payment of Premiums Implementation Guide",
    href: "/chp/IG_CS21_NonFinancialNonPaymentOfPremiums.pdf",
  },
  {
    title: "CS 23",
    text: "Non-Financial Requirements - Other Eligibility Standards Implementation Guide",
    href: "/chp/IG_CS23_NonFinancialRequirementOtherEligibilityStandards.pdf",
  },
  {
    title: "CS 27",
    text: "General Eligibility - Continuous Eligibility Implementation Guide",
    href: "/chp/IG_CS27_ContinuousEligibility.pdf",
  },
  {
    title: "CS 28",
    text: "General Eligibility - Presumptive Eligibility for Children Implementation Guide",
    href: "/chp/IG_CS28_PresumptiveEligibilityForChildren.pdf",
  },
  {
    title: "CS 29",
    text: "General Eligibility - Presumptive Eligibility for Pregnant Women Implementation Guide",
    href: "/chp/IG_CS29_PresumptiveEligibilityForPregnantWomen.pdf",
  },
  {
    title: "CS 31",
    text: "Incarcerated CHIP Beneficiaries Implementation Guide",
    href: "/chp/IG_CS31_IncarceratedCHIPBeneficiaries-A.pdf",
  },
];

export const ChipSpaImplementationGuides = () => {
  const useNewCs31 = useFeatureFlag("CS31_ALT");

  const nonFinancialGuides: Template[] = CHP_NON_FIN_GUIDES.map((guide) =>
    guide.title === "CS 31"
      ? {
          ...guide,
          href: useNewCs31
            ? "/chp/IG_CS31_IncarceratedCHIPBeneficiaries-B.pdf"
            : "/chp/IG_CS31_IncarceratedCHIPBeneficiaries-A.pdf",
        }
      : guide,
  );

  return (
    <div>
      <section className="space-y-2">
        <p>CHIP eligibility SPA implementation guides can be downloaded at the links below.</p>
        <ul className="list-disc pl-6" role="list">
          <li>
            <PdfLink
              href="/chp/IG_ChipEligibilityIntroduction.pdf"
              label="template"
              title="CHIP Eligibility Introduction"
              className=""
            />
          </li>
        </ul>
        <ul className="pl-6 space-y-2" role="list">
          <li className="space-y-2">
            <p>MAGI Eligibility & Methods</p>
            <PdfList
              list={CHP_MAGI_GUIDES}
              label="template"
              ulClassName="list-disc pl-6 space-y-2"
            />
          </li>
          <li className="space-y-2">
            <p>XXI Medicaid Expansion</p>
            <PdfList
              list={CHP_MED_EXPANSION_GUIDES}
              label="template"
              ulClassName="list-disc pl-6 space-y-2"
            />
          </li>
          <li className="space-y-2">
            <p>Eligibility Processing</p>
            <PdfList
              list={CHP_ELIGIBILITY_GUIDES}
              label="template"
              ulClassName="list-disc pl-6 space-y-2"
            />
          </li>
          <li className="space-y-2">
            <p>Non-Financial Eligibility</p>
            <PdfList
              list={nonFinancialGuides}
              label="template"
              ulClassName="list-disc pl-6 space-y-2"
            />
          </li>
        </ul>
      </section>
    </div>
  );
};
