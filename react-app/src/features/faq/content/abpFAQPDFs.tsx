import abp1PDF from "@/assets/abp/IG_ABP1_AlternativeBenefitPlanPopulations.pdf";
import abp2aPDF from "@/assets/abp/IG_ABP2a_VoluntaryBenefitPackageAssurances.pdf";
import abp2bPDF from "@/assets/abp/IG_ABP2b_VoluntaryEnrollmentAssurances.pdf";
import abp3PDF from "@/assets/abp/IG_ABP3_SelectionOfBenchmark20190819-Final.pdf";
import abp31PDF from "@/assets/abp/IG_ABP3.1_SelectionOfBenchmarkAfter2020.pdf";
import abp4PDF from "@/assets/abp/IG_ABP4_AbpCostSharing.pdf";
import abp5PDF from "@/assets/abp/IG_ABP5_BenefitsDescription-Final.pdf";
import abp6PDF from "@/assets/abp/IG_ABP6_BenchmarkEquivalentBenefit.pdf";
import abp7PDF from "@/assets/abp/IG_ABP7_BenefitAssurances.pdf";
import abp8PDF from "@/assets/abp/IG_ABP8_ServiceDeliverySystems.pdf";
import abp9PDF from "@/assets/abp/IG_ABP9_EmployerSponsoredInsurance.pdf";
import abp10PDF from "@/assets/abp/IG_ABP10_GeneralAssurances.pdf";
import abp11PDF from "@/assets/abp/IG_ABP11_PaymentMethodology.pdf";
import g1PDF from "@/assets/mpc/IG_G1_CostSharingRequirements.pdf";
import g2aPDF from "@/assets/mpc/IG_G2a_CostSharingAmountsCN.pdf";
import g2bPDF from "@/assets/mpc/IG_G2b_CostSharingAmountsMN.pdf";
import g2cPDF from "@/assets/mpc/IG_G2c_CostSharingAmountsTargeting.pdf";
import g3PDF from "@/assets/mpc/IG_G3_CostSharingAmountsTargeting.pdf";
import cs3PDF from "@/assets/chp/IG_CS3_MedicaidExpansion.pdf";
import cs7PDF from "@/assets/chp/IG_CS7_TargetedLow-IncomeChildren.pdf"
import cs8PDF from "@/assets/chp/IG_CS8_TargetedLow-IncomePregnantWomen.pdf"
import cs9PDF from "@/assets/chp/IG_CS9_CoverageFromConceptionToBirth.pdf"
import cs10PDF from "@/assets/chp/IG_CS10_ChildrenWhoHaveAccessToPublicEmployeeCoverage.pdf"
import cs11PDF from "@/assets/chp/IG_CS11_PregnantWomenWhoHaveAccessToPublicEmployeeCoverage.pdf"
import cs12PDF from "@/assets/chp/IG_CS12_DentalOnlySupplementalCoverage.pdf"
import cs13PDF from "@/assets/chp/IG_CS13_DeemedNewborns.pdf"
import cs14PDF from "@/assets/chp/IG_CS14_ChildrenIneligForMedicaid.pdf"
import cs15PDF from "@/assets/chp/IG_CS15_MAGI-BasedIncomeMethodologies.pdf"
import cs16PDF from "@/assets/chp/IG_CS16_Spenddown.pdf"
import cs17PDF from "@/assets/chp/IG_CS17_Non-Financial-Residency.pdf"
import cs18PDF from "@/assets/chp/IG_CS18_Non-Financial-Citizenship.pdf"
import cs19PDF from "@/assets/chp/IG_CS19_Non-Financial-SocialSecurityNumber.pdf"
import cs20PDF from "@/assets/chp/IG_CS20_Non-Financial-SubstitutionOfCoverage.pdf"
import cs21PDF from "@/assets/chp/IG_CS21_NonFinancialNonPaymentOfPremiums.pdf"
import cs23PDF from "@/assets/chp/IG_CS23_NonFinancialRequirementOtherEligibilityStandards.pdf"
import cs24PDF from "@/assets/chp/IG_CS24_EligibilityProcessing.pdf"
import cs27PDF from "@/assets/chp/IG_CS27_ContinuousEligibility.pdf"
import cs28PDF from "@/assets/chp/IG_CS28_PresumptiveEligibilityForChildren.pdf"
import cs29PDF from "@/assets/chp/IG_CS29_PresumptiveEligibilityForPregnantWomen.pdf"

export const renderSection = (
  title: string, 
  templates: any[], 
  filterCondition: (template: any) => boolean 
): JSX.Element => (
  <>
    <p className="p-2" style={{ color: "black", paddingTop: "16px" }}>
      {title}
    </p>
    <ul className="faq-section" style={{ paddingTop: "0" }}>
      {templates.filter(filterCondition).map((template) => (
        <li key={template.title} className="faq-list-item">
          <a
            href={template.href}
            target="_blank"
            rel="noopener noreferrer"
            className="faq-list-link"
          >
            {template.title}: {template.text}
          </a>
        </li>
      ))}
    </ul>
  </>
);

export const abpTemplates = [
  {
    title: "ABP 1",
    text: "Alternative Benefit Plan Populations",
    href: abp1PDF,
  },
  {
    title: "ABP 2a",
    text: "Voluntary Benefit Package Selection Assurances - Eligibility Group under Section 1902(a)(10)(A)(i)(VIII) of the Act",
    href: abp2aPDF,
  },
  {
    title: "ABP 2b",
    text: "Voluntary Enrollment Assurances for Eligibility Groups other than the Adult Group under Section 1902(a)(10)(A)(i)(VIII) of the Act",
    href: abp2bPDF,
  },
  {
    title: "ABP 3",
    text: "Selection of Benchmark Benefit Package or Benchmark-Equivalent Benefit Package\n* Use only if ABP has an effective date earlier than 1/1/2020 or if only changing the Section 1937 Coverage Option of an ABP implemented before 1/1/2020",
    href: abp3PDF,
    subtext: [
      "Use only if ABP has an effective date earlier than 1/1/2020 or if only changing the Section 1937 Coverage Option of an ABP implemented before 1/1/2020",
    ],
  },
  {
    title: "ABP 3.1",
    text: "Selection of Benchmark Benefit or Benchmark-Equivalent Benefit Package\n* Use only for ABPs effective on or after 1/1/2020",
    href: abp31PDF,
    subtext: [
      "Use only if ABP has an effective date earlier than 1/1/2020 or if only changing the Section 1937 Coverage Option of an ABP implemented before 1/1/2020",
    ],
  },
  {
    title: "ABP 4",
    text: "Alternative Benefit Plan Cost Sharing",
    href: abp4PDF,
  },
  {
    title: "ABP 5",
    text: "Benefits Description",
    href: abp5PDF,
  },
  {
    title: "ABP 6",
    text: "Benchmark-Equivalent Benefit Package",
    href: abp6PDF,
  },
  {
    title: "ABP 7",
    text: "Benefits Assurances",
    href: abp7PDF,
  },
  {
    title: "ABP 8",
    text: "Service Delivery Systems",
    href: abp8PDF,
  },
  {
    title: "ABP 9",
    text: "Employer-Sponsored Insurance and Payment of Premiums",
    href: abp9PDF,
  },
  {
    title: "ABP 10",
    text: "General Assurances",
    href: abp10PDF,
  },
  {
    title: "ABP 11",
    text: "Payment Methodology",
    href: abp11PDF,
  }
];

export const abpGuides = [
  {
    title: "ABP 1",
    text: "Alternative Benefit Plan Populations Implementation Guide",
    href: abp1PDF,
  },
  {
    title: "ABP 2a",
    text: "Voluntary Benefit Package Selection Assurances - Eligibility Group under Section 1902(a)(10)(A)(i)(VIII) of the Act Implementation Guide",
    href: abp2aPDF,
  },
  {
    title: "ABP 2b",
    text: "Voluntary Enrollment Assurances for Eligibility Groups other than the Adult Group under Section 1902(a)(10)(A)(i)(VIII) of the Act Implementation Guide",
    href: abp2bPDF,
  },
  {
    title: "ABP 3",
    text: "Selection of Benchmark Benefit Package or Benchmark-Equivalent Benefit Package Implementation Guide",
    href: abp3PDF,
  },
  {
    title: "ABP 3.1",
    text: "Selection of Benchmark Benefit or Benchmark-Equivalent Benefit Package Implementation Guide",
    href: abp31PDF,
  },
  {
    title: "ABP 4",
    text: "Alternative Benefit Plan Cost Sharing Implementation Guide",
    href: abp4PDF,
  },
  {
    title: "ABP 5",
    text: "Benefits Description Implementation Guide",
    href: abp5PDF,
  },
  {
    title: "ABP 6",
    text: "Benchmark-Equivalent Benefit Package Implementation Guide",
    href: abp6PDF,
  },
  {
    title: "ABP 7",
    text: "Benefits Assurances Implementation Guide",
    href: abp7PDF,
  },
  {
    title: "ABP 8",
    text: "Service Delivery Systems Implementation Guide",
    href: abp8PDF,
  },
  {
    title: "ABP 9",
    text: "Employer-Sponsored Insurance and Payment of Premiums Implementation Guide",
    href: abp9PDF,
  },
  {
    title: "ABP 10",
    text: "General Assurances Implementation Guide",
    href: abp10PDF,
  },
  {
    title: "ABP 11",
    text: "Payment Methodology Implementation Guide",
    href: abp11PDF,
  },
];

export const mpcTemplates = [
  {
    title: "G 1",
    text: "Cost-Sharing Requirements",
    href: g1PDF,
  },
  {
    title: "G 2a",
    text: "Cost-Sharing Amounts - Categorically Needy",
    href: g2aPDF,
  },
  {
    title: "G 2b",
    text: "Cost-Sharing Amounts - Medically Needy",
    href: g2bPDF,
  },
  {
    title: "G 2c",
    text: "Cost-Sharing Amounts - Targeting",
    href: g2cPDF,
  }
];


export const mpcGuides = [
  {
    title: "G 1",
    text: "Cost-Sharing Requirements Implementation Guide",
    href: g1PDF,
  },
  {
    title: "G 2a",
    text: "Cost-Sharing Amounts - Categorically Needy Implementation Guide",
    href: g2aPDF,
  },
  {
    title: "G 2b",
    text: "Cost-Sharing Amounts - Medically Needy Implementation Guide",
    href: g2bPDF,
  },
  {
    title: "G 2c",
    text: "Cost-Sharing Amounts - Targeting Implementation Guide",
    href: g2cPDF,
  },
  {
    title: "G 3",
    text: " Cost-Sharing Limitations Implementation Guide",
    href: g3PDF,
  }
];


export const chpTemplates = [
  // MAGI Eligibility & Methods
  {
    title: "CS 7",
    text: "Eligibility - Targeted Low-Income Children",
    href: cs7PDF,
  },
  {
    title: "CS 8",
    text: "Eligibility - Targeted Low-Income Pregnant Women",
    href: cs8PDF,
  },
  {
    title: "CS 9",
    text: "Eligibility - Coverage From Conception to Birth",
    href: cs9PDF,
  },
  {
    title: "CS 10",
    text: "Eligibility - Children Who Have Access to Public Employee Coverage",
    href: cs10PDF,
  },
  {
    title: "CS 11",
    text: "Eligibility - Pregnant Women Who Have Access to Public Employee Coverage",
    href: cs11PDF,
  },
  {
    title: "CS 12",
    text: "Eligibility - Dental Only Supplemental Coverage",
    href: cs12PDF,
  },
  {
    title: "CS 13",
    text: "Eligibility - Deemed Newborns",
    href: cs13PDF,
  },
  {
    title: "CS 15",
    text: "MAGI-Based Income Methodologies",
    href: cs15PDF,
  },
  {
    title: "CS 16",
    text: "Other Eligibility Criteria - Spenddowns",
    href: cs16PDF,
  },

  // XXI Medicaid Expansion
  {
    title: "CS 3",
    text: "Eligibility for Medicaid Expansion Program",
    href: cs3PDF,
  },

  // Establish 2101(f) Group
  {
    title: "CS 14",
    text: "Eligibility - Children Ineligible for Medicaid as a Result of the Elimination of Income Disregards",
    href: cs14PDF,
  },

  // Eligibility Processing
  {
    title: "CS 24",
    text: "General Eligibility - Eligibility Processing",
    href: cs24PDF,
  },

  // Non-Financial Eligibility
  {
    title: "CS 17",
    text: "Non-Financial Eligibility - Residency",
    href: cs17PDF,
  },
  {
    title: "CS 18",
    text: "Non-Financial Eligibility - Citizenship",
    href: cs18PDF,
  },
  {
    title: "CS 19",
    text: "Non-Financial Eligibility - Social Security Number",
    href: cs19PDF,
  },
  {
    title: "CS 20",
    text: "Non-Financial Eligibility - Substitution of Coverage",
    href: cs20PDF,
  },
  {
    title: "CS 21",
    text: "Non-Financial Eligibility - Non-Payment of Premiums",
    href: cs21PDF,
  },
  {
    title: "CS 23",
    text: "Non-Financial Requirements - Other Eligibility Standards",
    href: cs23PDF,
  },
  {
    title: "CS 27",
    text: "General Eligibility - Continuous Eligibility",
    href: cs27PDF,
  },
  {
    title: "CS 28",
    text: "General Eligibility - Presumptive Eligibility for Children",
    href: cs28PDF,
  },
  {
    title: "CS 29",
    text: "General Eligibility - Presumptive Eligibility for Pregnant Women",
    href: cs29PDF,
  },
];

export const chpGuides = [
  // MAGI Eligibility & Methods
  {
    title: "CS 7",
    text: "Eligibility - Targeted Low-Income Children Implementation Guide",
    href: cs7PDF,
  },
  {
    title: "CS 8",
    text: "Eligibility - Targeted Low-Income Pregnant Women Implementation Guide",
    href: cs8PDF,
  },
  {
    title: "CS 9",
    text: "Eligibility - Coverage From Conception to Birth Implementation Guide",
    href: cs9PDF,
  },
  {
    title: "CS 10",
    text: "Eligibility - Children Who Have Access to Public Employee Coverage Implementation Guide",
    href: cs10PDF,
  },
  {
    title: "CS 11",
    text: "Eligibility - Pregnant Women Who Have Access to Public Employee Coverage Implementation Guide",
    href: cs11PDF,
  },
  {
    title: "CS 12",
    text: "Eligibility - Dental Only Supplemental Coverage Implementation Guide",
    href: cs12PDF,
  },
  {
    title: "CS 13",
    text: "Eligibility - Deemed Newborns Implementation Guide",
    href: cs13PDF,
  },
  {
    title: "CS 15",
    text: "MAGI-Based Income Methodologies Implementation Guide",
    href: cs15PDF,
  },
  {
    title: "CS 16",
    text: "Other Eligibility Criteria - Spenddowns Implementation Guide",
    href: cs16PDF,
  },

  // XXI Medicaid Expansion
  {
    title: "CS 3",
    text: "Eligibility for Medicaid Expansion Program Implementation Guide",
    href: cs3PDF,
  },

  // Establish 2101(f) Group
  {
    title: "CS 14",
    text: "Eligibility - Children Ineligible for Medicaid as a Result of the Elimination of Income Disregards Implementation Guide",
    href: cs14PDF,
  },

  // Eligibility Processing
  {
    title: "CS 24",
    text: "General Eligibility - Eligibility Processing Implementation Guide",
    href: cs24PDF,
  },

  // Non-Financial Eligibility
  {
    title: "CS 17",
    text: "Non-Financial Eligibility - Residency Implementation Guide",
    href: cs17PDF,
  },
  {
    title: "CS 18",
    text: "Non-Financial Eligibility - Citizenship Implementation Guide",
    href: cs18PDF,
  },
  {
    title: "CS 19",
    text: "Non-Financial Eligibility - Social Security Number Implementation Guide",
    href: cs19PDF,
  },
  {
    title: "CS 20",
    text: "Non-Financial Eligibility - Substitution of Coverage Implementation Guide",
    href: cs20PDF,
  },
  {
    title: "CS 21",
    text: "Non-Financial Eligibility - Non-Payment of Premiums Implementation Guide",
    href: cs21PDF,
  },
  {
    title: "CS 23",
    text: "Non-Financial Requirements - Other Eligibility Standards Implementation Guide",
    href: cs23PDF,
  },
  {
    title: "CS 27",
    text: "General Eligibility - Continuous Eligibility Implementation Guide",
    href: cs27PDF,
  },
  {
    title: "CS 28",
    text: "General Eligibility - Presumptive Eligibility for Children Implementation Guide",
    href: cs28PDF,
  },
  {
    title: "CS 29",
    text: "General Eligibility - Presumptive Eligibility for Pregnant Women Implementation Guide",
    href: cs29PDF,
  },
];
