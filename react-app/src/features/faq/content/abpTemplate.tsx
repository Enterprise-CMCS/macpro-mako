import abp1PDF from "@/assets/abp/ABP1.pdf";
import abp2aPDF from "@/assets/abp/ABP2a.pdf";
import abp2bPDF from "@/assets/abp/ABP2b.pdf";
import abp3PDF from "@/assets/abp/ABP3.pdf";
import abp31PDF from "@/assets/abp/ABP3.1.pdf";
import abp4PDF from "@/assets/abp/ABP4.pdf";
import abp5PDF from "@/assets/abp/ABP5.pdf";
import abp6PDF from "@/assets/abp/ABP6.pdf";
import abp7PDF from "@/assets/abp/ABP7.pdf";
import abp8PDF from "@/assets/abp/ABP8.pdf";
import abp9PDF from "@/assets/abp/ABP9.pdf";
import abp10PDF from "@/assets/abp/ABP10.pdf";
import abp11PDF from "@/assets/abp/ABP11.pdf";
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
    text: "Selection of Benchmark Benefit Package or Benchmark-Equivalent Benefit Package",
    href: abp3PDF,
    subtext: [
      "Use only if ABP has an effective date earlier than 1/1/2020 or if only changing the Section 1937 Coverage Option of an ABP implemented before 1/1/2020",
    ],
  },
  {
    title: "ABP 3.1",
    text: "Selection of Benchmark Benefit or Benchmark-Equivalent Benefit Package",
    href: abp31PDF,
    subtext: ["Use only for ABPs effective on or after 1/1/2020"],
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
