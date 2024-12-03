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
import { Template } from "./chpRenderSection";

export const ABP_TEMPLATES: Template[] = [
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
  },
];
