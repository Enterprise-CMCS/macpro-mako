import { Links } from "react-router-dom";
import { SubNavHeader } from "@/components";

export const ImplmentationGuide = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">
          Medicaid Alternative Benefit Plan Implementation Guides
        </h1>
      </SubNavHeader>
      <section className="max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <h2 className="font-bold">Implementation Guides:</h2>
        <ul className="p-3">
          <li className="mb-2">
            <a
              className="underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_AbpIntroduction.doc"
              target="_blank"
              rel="noreferrer"
            >
              Introduction
            </a>
          </li>
          <li className="mb-2">
            ABP1:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP1_AlternativeBenefitPlanPopulations.doc"
              target="_blank"
              rel="noreferrer"
            >
              Alternative Benefit Plan Populations
            </a>
          </li>
          <li className="mb-2">
            ABP2a:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP2a_VoluntaryBenefitPackageAssurances.doc"
              target="_blank"
              rel="noreferrer"
            >
              Voluntary Benefit Package Selection Assurances - Eligibility Group
              under Section 1902(a)(10)(A)(i)(VIII) of the Act
            </a>
          </li>
          <li className="mb-2">
            ABP2b:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP2b_VoluntaryEnrollmentAssurances.doc"
              target="_blank"
              rel="noreferrer"
            >
              Voluntary Enrollment Assurances for Eligibility Groups other than
              the Adult Group under Section 1902(a)(10)(A)(i)(VIII) of the Act
            </a>
          </li>
          <li className="mb-2">
            ABP2c:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP2c_EnrollmentAssurancesMandatoryParticipants.doc"
              target="_blank"
              rel="noreferrer"
            >
              Enrollment Assurances - Mandatory Participants
            </a>
          </li>
          <li className="mb-2">
            ABP3:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP3_SelectionOfBenchmark20190819-Final.docx"
              target="_blank"
              rel="noreferrer"
            >
              Selection of Benchmark Benefit Package or Benchmark-Equivalent
              Benefit Package
            </a>
          </li>
          <li className="mb-2">
            ABP3.1:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP3.1_SelectionOfBenchmark20190819-Final.docx"
              target="_blank"
              rel="noreferrer"
            >
              Selection of Benchmark Benefit Package or Benchmark-Equivalent
              Benefit Package
            </a>
          </li>
          <li className="mb-2">
            ABP4:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP4_AbpCostSharing.doc"
              target="_blank"
              rel="noreferrer"
            >
              Alternative Benefit Plan Cost-Sharing
            </a>
          </li>
          <li className="mb-2">
            ABP5:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP5_BenefitsDescription-Final.docx"
              target="_blank"
              rel="noreferrer"
            >
              Benefits Description
            </a>
          </li>
          <li className="mb-2">
            ABP6:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP6_BenchmarkEquivalentBenefit.doc"
              target="_blank"
              rel="noreferrer"
            >
              Benchmark-Equivalent Benefit Package
            </a>
          </li>
          <li className="mb-2">
            ABP7:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP7_BenefitAssurances.doce"
              target="_blank"
              rel="noreferrer"
            >
              Benefit Assurance
            </a>
          </li>
          <li className="mb-2">
            ABP8:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP8_ServiceDeliverySystems.doc"
              target="_blank"
              rel="noreferrer"
            >
              Service Delivery Systems
            </a>
          </li>
          <li className="mb-2">
            ABP9:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP9_EmployerSponsoredInsurance.doc"
              target="_blank"
              rel="noreferrer"
            >
              Employer Sponsored Insurance and Payment of Premiums
            </a>
          </li>
          <li className="mb-2">
            ABP10:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP10_GeneralAssurances.doc"
              target="_blank"
              rel="noreferrer"
            >
              General Assurances
            </a>
          </li>
          <li className="mb-2">
            ABP11:
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/IG_ABP11_PaymentMethodology.doc"
              target="_blank"
              rel="noreferrer"
            >
              Payment Methodology
            </a>
          </li>
        </ul>
        <h2 className="font-bold">Training Materials:</h2>
        <ul className="p-3">
          <li className="mb-2">
            <a
              className="ml-2 underline"
              href="https://www.medicaid.gov/media/162926"
              target="_blank"
              rel="noreferrer"
            >
              Alternative Benefit Plan State Training Webinar (2013-08-13 .wmv)
            </a>
          </li>
          <li className="mb-2">
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/ABPStateTraining.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Alternative Benefit Plan State Training (2020-04-24 .pdf)
            </a>
          </li>
          <li className="mb-2">
            <a
              className="ml-2 underline"
              href="https://wms-mmdl-dev.cms.gov/MMDLDOC/abp/ABPSPAProcess.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Alternative Benefit Plan SPA Process (2016-08-01 .pdf)
            </a>
          </li>
        </ul>
      </section>
    </>
  );
};
