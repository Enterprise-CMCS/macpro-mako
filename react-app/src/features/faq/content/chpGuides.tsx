import IG_cs3PDF from "@/assets/chp/IG_CS3_MedicaidExpansion.pdf";
import IG_cs7PDF from "@/assets/chp/IG_CS7_TargetedLow-IncomeChildren.pdf";
import IG_cs8PDF from "@/assets/chp/IG_CS8_TargetedLow-IncomePregnantWomen.pdf";
import IG_cs9PDF from "@/assets/chp/IG_CS9_CoverageFromConceptionToBirth.pdf";
import IG_cs10PDF from "@/assets/chp/IG_CS10_ChildrenWhoHaveAccessToPublicEmployeeCoverage.pdf";
import IG_cs11PDF from "@/assets/chp/IG_CS11_PregnantWomenWhoHaveAccessToPublicEmployeeCoverage.pdf";
import IG_cs12PDF from "@/assets/chp/IG_CS12_DentalOnlySupplementalCoverage.pdf";
import IG_cs13PDF from "@/assets/chp/IG_CS13_DeemedNewborns.pdf";
import IG_cs14PDF from "@/assets/chp/IG_CS14_ChildrenIneligForMedicaid.pdf";
import IG_cs15PDF from "@/assets/chp/IG_CS15_MAGI-BasedIncomeMethodologies.pdf";
import IG_cs16PDF from "@/assets/chp/IG_CS16_Spenddown.pdf";
import IG_cs17PDF from "@/assets/chp/IG_CS17_Non-Financial-Residency.pdf";
import IG_cs18PDF from "@/assets/chp/IG_CS18_Non-Financial-Citizenship.pdf";
import IG_cs19PDF from "@/assets/chp/IG_CS19_Non-Financial-SocialSecurityNumber.pdf";
import IG_cs20PDF from "@/assets/chp/IG_CS20_Non-Financial-SubstitutionOfCoverage.pdf";
import IG_cs21PDF from "@/assets/chp/IG_CS21_NonFinancialNonPaymentOfPremiums.pdf";
import IG_cs23PDF from "@/assets/chp/IG_CS23_NonFinancialRequirementOtherEligibilityStandards.pdf";
import IG_cs24PDF from "@/assets/chp/IG_CS24_EligibilityProcessing.pdf";
import IG_cs27PDF from "@/assets/chp/IG_CS27_ContinuousEligibility.pdf";
import IG_cs28PDF from "@/assets/chp/IG_CS28_PresumptiveEligibilityForChildren.pdf";
import IG_cs29PDF from "@/assets/chp/IG_CS29_PresumptiveEligibilityForPregnantWomen.pdf";
import { Template } from "./chpRenderSection";

export const CHP_GUIDES: Template[] = [
  // MAGI Eligibility & Methods
  {
    title: "CS 7",
    text: "Eligibility - Targeted Low-Income Children Implementation Guide",
    href: IG_cs7PDF,
  },
  {
    title: "CS 8",
    text: "Eligibility - Targeted Low-Income Pregnant Women Implementation Guide",
    href: IG_cs8PDF,
  },
  {
    title: "CS 9",
    text: "Eligibility - Coverage From Conception to Birth Implementation Guide",
    href: IG_cs9PDF,
  },
  {
    title: "CS 10",
    text: "Eligibility - Children Who Have Access to Public Employee Coverage Implementation Guide",
    href: IG_cs10PDF,
  },
  {
    title: "CS 11",
    text: "Eligibility - Pregnant Women Who Have Access to Public Employee Coverage Implementation Guide",
    href: IG_cs11PDF,
  },
  {
    title: "CS 12",
    text: "Eligibility - Dental Only Supplemental Coverage Implementation Guide",
    href: IG_cs12PDF,
  },
  {
    title: "CS 13",
    text: "Eligibility - Deemed Newborns Implementation Guide",
    href: IG_cs13PDF,
  },
  {
    title: "CS 15",
    text: "MAGI-Based Income Methodologies Implementation Guide",
    href: IG_cs15PDF,
  },
  {
    title: "CS 16",
    text: "Other Eligibility Criteria - Spenddowns Implementation Guide",
    href: IG_cs16PDF,
  },

  // XXI Medicaid Expansion
  {
    title: "CS 3",
    text: "Eligibility for Medicaid Expansion Program Implementation Guide",
    href: IG_cs3PDF,
  },

  // Establish 2101(f) Group
  {
    title: "CS 14",
    text: "Eligibility - Children Ineligible for Medicaid as a Result of the Elimination of Income Disregards Implementation Guide",
    href: IG_cs14PDF,
  },

  // Eligibility Processing
  {
    title: "CS 24",
    text: "General Eligibility - Eligibility Processing Implementation Guide",
    href: IG_cs24PDF,
  },

  // Non-Financial Eligibility
  {
    title: "CS 17",
    text: "Non-Financial Eligibility - Residency Implementation Guide",
    href: IG_cs17PDF,
  },
  {
    title: "CS 18",
    text: "Non-Financial Eligibility - Citizenship Implementation Guide",
    href: IG_cs18PDF,
  },
  {
    title: "CS 19",
    text: "Non-Financial Eligibility - Social Security Number Implementation Guide",
    href: IG_cs19PDF,
  },
  {
    title: "CS 20",
    text: "Non-Financial Eligibility - Substitution of Coverage Implementation Guide",
    href: IG_cs20PDF,
  },
  {
    title: "CS 21",
    text: "Non-Financial Eligibility - Non-Payment of Premiums Implementation Guide",
    href: IG_cs21PDF,
  },
  {
    title: "CS 23",
    text: "Non-Financial Requirements - Other Eligibility Standards Implementation Guide",
    href: IG_cs23PDF,
  },
  {
    title: "CS 27",
    text: "General Eligibility - Continuous Eligibility Implementation Guide",
    href: IG_cs27PDF,
  },
  {
    title: "CS 28",
    text: "General Eligibility - Presumptive Eligibility for Children Implementation Guide",
    href: IG_cs28PDF,
  },
  {
    title: "CS 29",
    text: "General Eligibility - Presumptive Eligibility for Pregnant Women Implementation Guide",
    href: IG_cs29PDF,
  },
];
