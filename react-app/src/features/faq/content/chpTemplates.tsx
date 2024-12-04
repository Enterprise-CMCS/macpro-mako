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
import { Template } from "./chpRenderSection";

  export const CHP_TEMPLATES: Template[] = [
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