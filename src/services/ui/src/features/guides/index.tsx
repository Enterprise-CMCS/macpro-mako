import { SubNavHeader } from "@/components";
import * as UI from "@/components";
import { Guide } from "shared-types";

export const ABPGuide = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">
          Medicaid Alternative Benefit Plan Implementation Guides
        </h1>
      </SubNavHeader>
      <section className="max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <div className="h-[5px] bg-gradient-to-r from-primary from-50% to-[#02bfe7] to-[66%] rounded-t"></div>
        <UI.Table className="flex-1 min-h-[calc(100vh-350px)]">
          <UI.TableHeader className="sticky top-0 bg-white">
            <UI.TableRow>
              <UI.TableHead className="w-[10px]">Guide</UI.TableHead>
              <UI.TableHead className="w-[10px]">Link</UI.TableHead>
            </UI.TableRow>
          </UI.TableHeader>

          <UI.TableBody>
            {abp_forms.map((row) => (
              <UI.TableRow className="h-10" key={row.title}>
                <UI.TableCell>{row.title}</UI.TableCell>
                <UI.TableCell>
                  <a
                    href={row.href}
                    target={row.targetBlank ? "_blank" : undefined}
                    rel="noreferrer"
                    className="underline"
                  >
                    {row.linkTitle}
                  </a>
                </UI.TableCell>
              </UI.TableRow>
            ))}
          </UI.TableBody>
        </UI.Table>
      </section>
    </>
  );
};

const abp_forms: Guide[] = [
  {
    title: "Introduction",
    linkTitle: "Introduction",
    href: "/forms/abp/IG_AbpIntroduction.doc",
  },
  {
    title: "ABP1",
    linkTitle: "Alternative Benefit Plan Populations",
    href: "/forms/abp/IG_ABP1_AlternativeBenefitPlanPopulations.doc",
  },
  {
    title: "ABP2a",
    linkTitle:
      "Voluntary Benefit Package Selection Assurances - Eligibility Group under Section 1902(a)(10)(A)(i)(VIII) of the Act",
    href: "/forms/abp/IG_ABP2a_VoluntaryBenefitPackageAssurances.doc",
  },
  {
    title: "ABP2b",
    linkTitle:
      "Voluntary Enrollment Assurances for Eligibility Groups other than the Adult Group under Section 1902(a)(10)(A)(i)(VIII) of the Act",
    href: "/forms/abp/IG_ABP2b_VoluntaryEnrollmentAssurances.doc",
  },
  {
    title: "ABP2c",
    linkTitle: "Enrollment Assurances - Mandatory Participants",
    href: "/forms/abp/IG_ABP2c_EnrollmentAssurancesMandatoryParticipants.doc",
  },
  {
    title: "ABP3",
    linkTitle:
      "Selection of Benchmark Benefit Package or Benchmark-Equivalent Benefit Package",
    href: "/forms/abp/IG_ABP3_SelectionOfBenchmark20190819-Final.docx",
  },
  {
    title: "ABP3.1",
    linkTitle:
      "Selection of Benchmark Benefit Package or Benchmark-Equivalent Benefit Package",
    href: "/forms/abp/IG_ABP3.1_SelectionOfBenchmark20190819-Final.docx",
  },
  {
    title: "ABP4",
    linkTitle: "Alternative Benefit Plan Cost-Sharing",
    href: "/forms/abp/IG_ABP4_AbpCostSharing.doc",
  },
  {
    title: "ABP5",
    linkTitle: "Benefits Description",
    href: "/forms/abp/IG_ABP5_BenefitsDescription-Final.docx",
  },
  {
    title: "ABP6",
    linkTitle: "Benchmark-Equivalent Benefit Package",
    href: "/forms/abp/IG_ABP6_BenchmarkEquivalentBenefit.doc",
  },
  {
    title: "ABP7",
    linkTitle: "Benefit Assurance",
    href: "/forms/abp/IG_ABP7_BenefitAssurances.doc",
  },
  {
    title: "ABP8",
    linkTitle: "Service Delivery Systems",
    href: "/forms/abp/IG_ABP8_ServiceDeliverySystems.doc",
  },
  {
    title: "ABP9",
    linkTitle: "Employer Sponsored Insurance and Payment of Premiums",
    href: "/forms/abp/IG_ABP9_EmployerSponsoredInsurance.doc",
  },
  {
    title: "ABP10",
    linkTitle: "General Assurances",
    href: "/forms/abp/IG_ABP10_GeneralAssurances.doc",
  },
  {
    title: "ABP11",
    linkTitle: "Payment Methodology",
    href: "/forms/abp/IG_ABP11_PaymentMethodology.doc",
  },
  {
    title: "Alternative Benefit Plan State Training Webinar",
    linkTitle:
      "Alternative Benefit Plan State Training Webinar (2013-08-13 .wmv)",
    href: "https://www.medicaid.gov/media/162926",
    targetBlank: true,
  },
  {
    title: "Alternative Benefit Plan State Training",
    linkTitle: "Alternative Benefit Plan State Training (2020-04-24 .pdf)",
    href: "/forms/abp/ABPStateTraining.pdf",
    targetBlank: true,
  },
  {
    title: "Alternative Benefit Plan SPA Process",
    linkTitle: "Alternative Benefit Plan SPA Process (2016-08-01 .pdf)",
    href: "/forms/abp/ABPSPAProcess.pdf",
    targetBlank: true,
  },
];
