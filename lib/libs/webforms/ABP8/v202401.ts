import { FormSchema } from "shared-types";
import {
  additionalInfo,
  createSectionId,
  deliverySystemCharactaristics,
  disenrollment,
  generateDependency,
  managedCare,
  participationExclusions,
  participationRequirements,
  payments,
  procurementOrSelection,
  SectionDependencyInfo,
  SectionName,
} from "./sections/v202401";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

const formId = "abp8";

// Section dependency values, used for sections and sub-sections --------------

const deliverySystemsFormName = `${formId}_delivery-systems_managed-care-delivery-systems`;

const sectionDependency: Record<string, SectionDependencyInfo> = {
  HIO: {
    name: deliverySystemsFormName,
    expectedValue: createSectionId(SectionName.HIO),
  },
  MCO: {
    name: deliverySystemsFormName,
    expectedValue: createSectionId(SectionName.MCO),
  },
  PAHP: {
    name: deliverySystemsFormName,
    expectedValue: createSectionId(SectionName.PAHP),
  },
  PCCM: {
    name: deliverySystemsFormName,
    expectedValue: createSectionId(SectionName.PCCM),
  },
  PCCMEntity: {
    name: deliverySystemsFormName,
    expectedValue: createSectionId(SectionName.PCCMEntity),
  },
  PIHP: {
    name: deliverySystemsFormName,
    expectedValue: createSectionId(SectionName.PIHP),
  },
};

// Form schema ----------------------------------------------------------------

export const v202401: FormSchema = {
  header: "ABP 8: Service delivery systems",
  formId,
  sections: [
    {
      title: "Delivery systems",
      sectionId: "delivery-systems",
      form: [
        {
          description:
            "Provide detail about the type of delivery system(s) the state/territory will use for the Alternative Benefit Plan's (ABP’s) benchmark benefit package or benchmark-equivalent benefit package, including any variation by the participants' geographic area.",
          descriptionClassName: "font-normal",
          slots: [
            {
              rhf: "Checkbox",
              label: "Managed care delivery systems",
              name: "managed-care-delivery-systems",
              labelClassName: "font-bold",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "Managed care organization (MCO)",
                    value: "mco",
                  },
                  {
                    label: "Health insuring organization (HIO) (California only)",
                    value: "hio",
                  },
                  {
                    label: "Prepaid inpatient health plan (PIHP)",
                    value: "pihp",
                  },
                  {
                    label: "Prepaid ambulatory health plan (PAHP)",
                    value: "pahp",
                  },
                  {
                    label: "Primary care case management (PCCM)",
                    value: "pccm",
                  },
                  {
                    label: "Primary care case management entity (PCCM entity)",
                    value: "pccm-entity",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Managed care options",
      sectionId: "managed-care-options",
      dependency: {
        conditions: [
          {
            name: deliverySystemsFormName,
            type: "valueExists",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "state-territory-complicance",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory certifies it will comply with all applicable Medicaid laws and regulations, including but not limited to Sections 1903(m), 1905(t), and 1932 of the Act and 42 CFR Part 438 in providing managed care services through this ABP.",
                    value: "certifies-compliance",
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              label:
                "Describe the implementation plan for the ABP under managed care, including member, stakeholder, and provider outreach efforts.",
              name: "implementation-plan",
              labelClassName: "font-bold",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: {
                className: "min-h-[114px]",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Enrollment process",
      sectionId: "enrollment-process",
      subsection: true,
      dependency: {
        conditions: [
          {
            name: deliverySystemsFormName,
            type: "valueExists",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "Complete the below based on whether voluntary and/or mandatory enrollment are applicable to your program (definitions in 42 CFR 438.54(b)).",
          descriptionClassName: "font-normal",
          slots: [
            {
              rhf: "TextDisplay",
              text: "Voluntary enrollment (42 CFR 438.54(c))",
              name: "voluntary-enrollment-textdisplay",
              props: { className: "text-black font-bold" },
            },
            {
              rhf: "Textarea",
              label:
                "How does the state fulfill its obligations to provide information as specified in 42 CFR 438.10(c)(4), 42 CFR 438.10(e), and 42 CFR 438.54(c)(3)?",
              labelClassName: "font-bold",
              name: "voluntary-enrollment-info",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: {
                className: "min-h-[114px]",
              },
            },
            {
              rhf: "TextDisplay",
              text: "States with voluntary enrollment must have an enrollment choice period or a passive enrollment process where the state enrolls the potential enrollee into a managed care plan, PCCM, or PCCM entity and simultaneously provides a period of time for the enrollee to make an active choice of delivery system.",
              name: "states-with-voluntary-enrollment",
            },
            {
              rhf: "Checkbox",
              label: "Which of the following will apply to the managed care program?",
              labelClassName: "font-bold",
              name: "voluntary-enrollment-options",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state provides an enrollment choice period, as described in 42 CFR 438.54(c)(1)(i) and 42 CFR 438.54(c)(2)(i), during which individuals who are subject to voluntary enrollment may make an active choice to enroll in the managed care program or will otherwise continue to receive covered services through the fee-for-service (FFS) delivery system.",
                    value: "enrollment-choice-period",
                    slots: [
                      {
                        rhf: "Input",
                        label: "Length of enrollment choice period",
                        name: "enrollment-choice-period-length",
                        labelClassName: "font-bold",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          className: "w-full",
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The state uses a passive enrollment process, as described in 42 CFR 438.54(c)(1)(ii) and 438.54 (c)(2)(ii), for individuals who are subject to voluntary enrollment.",
                    value: "passive-enrollment",
                    slots: [
                      {
                        rhf: "Textarea",
                        label:
                          "Describe the method used for passive enrollment and how the method and the state’s provision of information meet all the requirements of 42 CFR 438.54(c)(4), (5), (6), (7), and (8).",
                        labelClassName: "font-bold",
                        name: "passive-enrollment-method",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message: "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: {
                          className: "min-h-[114px]",
                        },
                      },
                      {
                        rhf: "Input",
                        label:
                          "How much time will the enrollee have to disenroll from the plan and return to the FFS delivery system?",
                        labelClassName: "font-bold",
                        name: "disenroll-time",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          className: "w-full",
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "TextDisplay",
              text: "Mandatory enrollment (42 CFR 438.54(d))",
              name: "mandatory-enrollment-textdisplay",
              props: { className: "text-black font-bold" },
            },
            {
              rhf: "Textarea",
              label:
                "How will the state fulfill its obligations to provide information as specified in 42 CFR 438.10(c)(4), 42 CFR 438.10(e), and 42 CFR 438.54(d)(3)?",
              labelClassName: "font-bold",
              name: "mandatory-enrollment-info",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: {
                className: "min-h-[114px]",
              },
            },
            {
              rhf: "Checkbox",
              name: "mandatory-enrollment-options",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state provides an enrollment choice period, as described in 42 CFR 438.54(d)(2)(i), during which individuals who are subject to mandatory enrollment may make an active choice to select a managed care plan or will otherwise be enrolled in a plan selected by the state’s default enrollment process.",
                    value: "enrollment-choice-period",
                    slots: [
                      {
                        rhf: "Input",
                        label: "Length of enrollment choice period",
                        name: "enrollment-choice-period-length",
                        labelClassName: "font-bold",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          className: "w-full",
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The state uses a default enrollment process, as described in 42 CFR 438.54(d)(5), for individuals who are subject to mandatory enrollment.",
                    value: "default-enrollment",
                    slots: [
                      {
                        rhf: "Textarea",
                        label:
                          "Describe the method used for default enrollment and how it meets all the requirements of 42 CFR 438.54(d)(4), (5), (7), and (8).",
                        labelClassName: "font-bold",
                        name: "default-enrollment-method",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message: "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: {
                          className: "min-h-[114px]",
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The state uses a passive enrollment process, as described in 42 CFR 438.54(d)(2), for individuals who are subject to mandatory enrollment.",
                    value: "passive-enrollment",
                    slots: [
                      {
                        rhf: "Textarea",
                        label:
                          "Describe the method used for passive enrollment and how it meets all of the requirements of 42 CFR 438.54(d)(4), (6), (7), and (8).",
                        labelClassName: "font-bold",
                        name: "passive-enrollment-method",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message: "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: {
                          className: "min-h-[114px]",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    // MCO --------------------------------------------------------------------

    managedCare({
      conditionalInfo: sectionDependency.MCO,
      programLabel: SectionName.MCO,
      title: "Managed care organizations (MCOs)",
    }),
    procurementOrSelection({
      programLabel: SectionName.MCO,
      conditionalInfo: sectionDependency.MCO,
    }),
    deliverySystemCharactaristics({
      programLabel: SectionName.MCO,
      conditionalInfo: sectionDependency.MCO,
    }),
    participationExclusions({
      programLabel: SectionName.MCO,
      conditionalInfo: sectionDependency.MCO,
    }),
    participationRequirements({
      programLabel: SectionName.MCO,
      conditionalInfo: sectionDependency.MCO,
    }),
    disenrollment({
      programLabel: SectionName.MCO,
      conditionalInfo: sectionDependency.MCO,
    }),
    {
      title: "Assurances",
      sectionId: `${createSectionId(SectionName.MCO)}-assurances`,
      subsection: true,
      dependency: generateDependency({
        name: sectionDependency.MCO.name,
        expectedValue: sectionDependency.MCO.expectedValue,
      }),
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state assures all applicable managed care requirements of 42 CFR 438 and 42 CFR 449.385 will be met.",
                    value: "managed-care-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.4, 438.5, 438.6, 438.7, 438.8, and 438.74 for payments under any risk contracts will be met.",
                    value: "risk-contracts-payments-requirements-met",
                  },
                  {
                    label:
                      "The state plan program applies the rural exception to choice requirements of 42 CFR 438.52(a) for MCOs in accordance with 42 CFR 438.52(b).",
                    value: "rural-exception-applied",
                    slots: [
                      {
                        rhf: "Input",
                        label: "Impacted rural counties",
                        labelClassName: "font-bold",
                        name: "rural-counties",
                        rules: {
                          required: "* Required",
                        },
                      },
                      {
                        rhf: "Checkbox",
                        name: "rural-exception-options",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: [
                            {
                              label:
                                "This provision is not applicable to this ABP state plan amendment (SPA).",
                              value: "not-applicable",
                            },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The state assures that, per the choice requirements in 42 CFR 438.52, Medicaid beneficiaries with mandatory enrollment in an MCO will have a choice between at least two MCOs unless the area is considered rural as defined in 42 CFR 438.52(b)(3).",
                    value: "mco-choice-requirements-met",
                  },
                  {
                    label:
                      "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                    value: "disenrollment-requests-permitted",
                  },
                  {
                    label:
                      "The state assures the limitations on Medicaid beneficiaries to change between primary care providers will be no more restrictive than the limitations on disenrollment described at 438.56(c).",
                    value: "provider-change-limitations",
                  },
                  {
                    label:
                      "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                    value: "automatic-reenrollment",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(a), (b), and (c) regarding a monitoring system and using data to improve the performance of its managed care program will be met.",
                    value: "monitoring-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(d) regarding readiness assessment will be met.",
                    value: "readiness-assessment-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(e) regarding reporting to CMS about the managed care program will be met.",
                    value: "cms-reporting-requirements-met",
                  },
                  {
                    label:
                      "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in an MCO/HIO/PIHP/PAHP/PCCM/PCCM entity.",
                    value: "beneficiary-support-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                    value: "mandatory-exempt-groups-identified",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                    value: "family-planning-freedom-of-choice-met",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    additionalInfo({
      programLabel: SectionName.MCO,
      conditionalInfo: sectionDependency.MCO,
    }),

    // HIO --------------------------------------------------------------------

    managedCare({
      conditionalInfo: sectionDependency.HIO,
      title: "Health insuring organizations (HIOs)",
      programLabel: SectionName.HIO,
    }),
    procurementOrSelection({
      programLabel: SectionName.HIO,
      conditionalInfo: sectionDependency.HIO,
    }),
    deliverySystemCharactaristics({
      programLabel: SectionName.HIO,
      conditionalInfo: sectionDependency.HIO,
    }),
    participationExclusions({
      programLabel: SectionName.HIO,
      conditionalInfo: sectionDependency.HIO,
    }),
    participationRequirements({
      programLabel: SectionName.HIO,
      conditionalInfo: sectionDependency.HIO,
    }),
    disenrollment({
      programLabel: SectionName.HIO,
      conditionalInfo: sectionDependency.HIO,
    }),
    {
      title: "Assurances",
      sectionId: `${createSectionId(SectionName.HIO)}-assurances`,
      subsection: true,
      dependency: generateDependency({
        name: sectionDependency.HIO.name,
        expectedValue: sectionDependency.HIO.expectedValue,
      }),
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state assures all applicable managed care requirements of 42 CFR 438 and 42 CFR 449.385 will be met.",
                    value: "managed-care-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.4, 438.5, 438.6, 438.7, 438.8, and 438.74 for payments under any risk contracts will be met.",
                    value: "risk-contracts-payments-requirements-met",
                  },
                  {
                    label:
                      "The state assures that, per the requirements at 438.52(c), Medicaid beneficiaries enrolled in an HIO will have a choice between at least two primary care providers within the entity.",
                    value: "hio-choice-requirements-met",
                  },
                  {
                    label:
                      "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                    value: "disenrollment-requests-permitted",
                  },
                  {
                    label:
                      "The state assures the limitations on Medicaid beneficiaries to change between primary care providers will be no more restrictive than the limitations on disenrollment described at 438.56(c).",
                    value: "provider-change-limitations",
                  },
                  {
                    label:
                      "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                    value: "automatic-reenrollment",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(a), (b), and (c) regarding a monitoring system and using data to improve the performance of its managed care program will be met.",
                    value: "monitoring-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(d) regarding readiness assessment will be met.",
                    value: "readiness-assessment-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(e) regarding reporting to CMS about the managed care program will be met.",
                    value: "cms-reporting-requirements-met",
                  },
                  {
                    label:
                      "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in MCO/HIO/PIHP/PAHP/PCCM/PCCM entity.",
                    value: "beneficiary-support-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                    value: "mandatory-exempt-groups-identified",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                    value: "family-planning-freedom-of-choice-met",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    additionalInfo({
      programLabel: SectionName.HIO,
      conditionalInfo: sectionDependency.HIO,
    }),

    // PIHP -------------------------------------------------------------------

    managedCare({
      conditionalInfo: sectionDependency.PIHP,
      title: "Prepaid inpatient health plans (PIHPs)",
      programLabel: SectionName.PIHP,
    }),
    procurementOrSelection({
      conditionalInfo: sectionDependency.PIHP,
      programLabel: SectionName.PIHP,
    }),
    deliverySystemCharactaristics({
      conditionalInfo: sectionDependency.PIHP,
      programLabel: SectionName.PIHP,
    }),
    participationExclusions({
      conditionalInfo: sectionDependency.PIHP,
      programLabel: SectionName.PIHP,
    }),
    participationRequirements({
      conditionalInfo: sectionDependency.PIHP,
      programLabel: SectionName.PIHP,
    }),
    disenrollment({
      conditionalInfo: sectionDependency.PIHP,
      programLabel: SectionName.PIHP,
    }),
    {
      title: "Assurances",
      sectionId: `${createSectionId(SectionName.PIHP)}-assurances`,
      subsection: true,
      dependency: generateDependency({
        name: sectionDependency.PIHP.name,
        expectedValue: sectionDependency.PIHP.expectedValue,
      }),
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state assures all applicable managed care requirements of 42 CFR 438 and 42 CFR 449.385 will be met.",
                    value: "managed-care-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.2 payments under any non-risk contracts will be met.",
                    value: "non-risk-payments-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.4, 438.5, 438.6, 438.7, 438.8, and 438.74 for payments under any risk contracts will be met.",
                    value: "risk-contracts-payments-requirements-met",
                  },
                  {
                    label:
                      "The state plan program applies the rural exception to choice requirements of 42 CFR 438.52(a) for PIHPs in accordance with 42 CFR 438.52(b).",
                    value: "assures-rural-exception",
                    slots: [
                      {
                        rhf: "Input",
                        label: "Impacted rural counties",
                        labelClassName: "font-bold",
                        name: "rural-counties",
                        rules: {
                          required: "* Required",
                        },
                      },
                      {
                        rhf: "Checkbox",
                        name: "rural-exception-options",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: [
                            {
                              label:
                                "This provision is not applicable to this ABP state plan amendment (SPA).",
                              value: "not-applicable",
                            },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The state assures that, per the choice requirements in 42 CFR 438.52, Medicaid beneficiaries with mandatory enrollment in a PIHP will have a choice between at least two PIHPs unless the area is considered rural as defined in 42 CFR 438.52(b)(3).",
                    value: "choice-requirements-met",
                  },
                  {
                    label:
                      "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                    value: "disenrollment-requests-permitted",
                  },
                  {
                    label:
                      "The state assures the limitations on Medicaid beneficiaries to change between primary care providers will be no more restrictive than the limitations on disenrollment described at 438.56(c).",
                    value: "provider-change-limitations",
                  },
                  {
                    label:
                      "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                    value: "automatic-reenrollment",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(a), (b), and (c) regarding a monitoring system and using data to improve the performance of its managed care program will be met.",
                    value: "monitoring-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(d) regarding readiness assessment will be met.",
                    value: "readiness-assessment-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(e) regarding reporting to CMS about the managed care program will be met.",
                    value: "cms-reporting-requirements-met",
                  },
                  {
                    label:
                      "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in MCO/HIO/PIHP/PAHP/PCCM/PCCM entity.",
                    value: "beneficiary-support-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                    value: "mandatory-exempt-groups-identified",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                    value: "family-planning-freedom-of-choice-met",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of Section 1905(t) of the Act for PCCMs and PCCM contracts (including for PCCM entities) will be met.",
                    value: "pccm-requirements-met",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    additionalInfo({
      conditionalInfo: sectionDependency.PIHP,
      programLabel: SectionName.PIHP,
    }),

    // PAHP -------------------------------------------------------------------

    managedCare({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
      title: "Prepaid ambulatory health plans (PAHPs)",
    }),
    procurementOrSelection({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
    }),
    deliverySystemCharactaristics({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
    }),
    participationExclusions({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
    }),
    participationRequirements({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
    }),
    disenrollment({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
    }),
    {
      title: "Assurances",
      sectionId: `${createSectionId(SectionName.PAHP)}-assurances`,
      subsection: true,
      dependency: generateDependency({
        name: sectionDependency.PAHP.name,
        expectedValue: sectionDependency.PAHP.expectedValue,
      }),
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state assures all applicable managed care requirements of 42 CFR 438 and 42 CFR 449.385 will be met.",
                    value: "managed-care-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.2 payments under any non-risk contracts will be met.",
                    value: "non-risk-payments-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.4, 438.5, 438.6, 438.7, 438.8, and 438.74 for payments under any risk contracts will be met.",
                    value: "risk-contracts-payments-requirements-met",
                  },
                  {
                    label:
                      "The state plan program applies the rural exception to choice requirements of 42 CFR 438.52(a) for PAHPs in accordance with 42 CFR 438.52(b).",
                    value: "assures-rural-exception",
                    slots: [
                      {
                        rhf: "Input",
                        label: "Impacted rural counties",
                        labelClassName: "font-bold",
                        name: "rural-counties",
                        rules: {
                          required: "* Required",
                        },
                      },
                      {
                        rhf: "Checkbox",
                        name: "rural-exception-options",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: [
                            {
                              label:
                                "This provision is not applicable to this ABP state plan amendment (SPA).",
                              value: "not-applicable",
                            },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The state assures that, per the choice requirements in 42 CFR 438.52, Medicaid beneficiaries with mandatory enrollment in an PAHP will have a choice between at least two PAHPs unless the area is considered rural as defined in 42 CFR 438.52(b)(3).",
                    value: "choice-requirements-met",
                  },
                  {
                    label:
                      "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                    value: "disenrollment-requests-permitted",
                  },
                  {
                    label:
                      "The state assures the limitations on Medicaid beneficiaries to change between primary care providers will be no more restrictive than the limitations on disenrollment described at 438.56(c).",
                    value: "provider-change-limitations",
                  },
                  {
                    label:
                      "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                    value: "automatic-reenrollment",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(a), (b), and (c) regarding a monitoring system and using data to improve the performance of its managed care program will be met.",
                    value: "monitoring-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(d) regarding readiness assessment will be met.",
                    value: "readiness-assessment-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(e) regarding reporting to CMS about the managed care program will be met.",
                    value: "cms-reporting-requirements-met",
                  },
                  {
                    label:
                      "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in MCO/HIO/PIHP/PAHP/PCCM/PCCM entity.",
                    value: "beneficiary-support-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                    value: "mandatory-exempt-groups-identified",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                    value: "family-planning-freedom-of-choice-met",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of Section 1905(t) of the Act for PCCMs and PCCM contracts (including for PCCM entities) will be met.",
                    value: "pccm-requirements-met",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    additionalInfo({
      conditionalInfo: sectionDependency.PAHP,
      programLabel: SectionName.PAHP,
    }),

    // PCCM -------------------------------------------------------------------

    managedCare({
      conditionalInfo: sectionDependency.PCCM,
      programLabel: SectionName.PCCM,
      title: "Primary care case management (PCCM)",
    }),
    deliverySystemCharactaristics({
      conditionalInfo: sectionDependency.PCCM,
      programLabel: SectionName.PCCM,
    }),
    payments({
      conditionalInfo: sectionDependency.PCCM,
      programLabel: SectionName.PCCM,
    }),
    disenrollment({
      conditionalInfo: sectionDependency.PCCM,
      programLabel: SectionName.PCCM,
    }),
    {
      title: "Assurances",
      sectionId: `${createSectionId(SectionName.PCCM)}-assurances`,
      subsection: true,
      dependency: generateDependency({
        name: sectionDependency.PCCM.name,
        expectedValue: sectionDependency.PCCM.expectedValue,
      }),
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state assures all applicable managed care requirements of 42 CFR 438 and 42 CFR 449.385 will be met.",
                    value: "managed-care-requirements-met",
                  },
                  {
                    label:
                      "The state assures that, per the choice requirements in 42 CFR 438.52, Medicaid beneficiaries with mandatory enrollment in a PCCM system will have a choice of at least two primary care case managers employed by or contracted with the state.",
                    value: "non-risk-payments-requirements-met",
                  },
                  {
                    label:
                      "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                    value: "disenrollment-requests-permitted",
                  },
                  {
                    label:
                      "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                    value: "automatic-reenrollment",
                  },
                  {
                    label:
                      "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in MCO/HIO/PIHP/PAHP/PCCM/PCCM entity.",
                    value: "beneficiary-support-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                    value: "mandatory-exempt-groups-identified",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                    value: "family-planning-freedom-of-choice-met",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of Section 1905(t) of the Act for PCCMs and PCCM contracts (including for PCCM entities) will be met.",
                    value: "pccm-requirements-met",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    additionalInfo({
      conditionalInfo: sectionDependency.PCCM,
      programLabel: SectionName.PCCM,
    }),

    // PCCM entity ------------------------------------------------------------

    managedCare({
      conditionalInfo: sectionDependency.PCCMEntity,
      programLabel: SectionName.PCCMEntity,
      title: "PCCM entity",
    }),
    deliverySystemCharactaristics({
      conditionalInfo: sectionDependency.PCCMEntity,
      programLabel: SectionName.PCCMEntity,
    }),
    payments({
      conditionalInfo: sectionDependency.PCCMEntity,
      programLabel: SectionName.PCCMEntity,
    }),
    disenrollment({
      conditionalInfo: sectionDependency.PCCMEntity,
      programLabel: SectionName.PCCMEntity,
    }),
    {
      title: "Assurances",
      sectionId: `${createSectionId(SectionName.PCCMEntity)}-assurances`,
      subsection: true,
      dependency: generateDependency({
        name: sectionDependency.PCCMEntity.name,
        expectedValue: sectionDependency.PCCMEntity.expectedValue,
      }),
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state assures that all the applicable requirements of the ABP for the state’s option to limit freedom of choice by requiring beneficiaries to receive their benefits through managed care entities will be met.",
                    value: "freedom-of-choice-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable managed care requirements of 42 CFR 438 and 42 CFR 449.385 will be met.",
                    value: "managed-care-requirements-met",
                  },
                  {
                    label:
                      "The state assures that, per the choice requirements in 42 CFR 438.52, Medicaid beneficiaries with mandatory enrollment in a PCCM entity may be limited to a single PCCM entity and will have a choice of at least two PCCMs employed by or contracted with the PCCM entity.",
                    value: "choice-requirements-met",
                  },
                  {
                    label:
                      "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                    value: "disenrollment-requests-permitted",
                  },
                  {
                    label:
                      "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                    value: "automatic-reenrollment",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(a), (b), and (c) regarding a monitoring system and using data to improve the performance of its managed care program will be met.",
                    value: "monitoring-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(d) regarding readiness assessment will be met.",
                    value: "readiness-assessment-requirements-met",
                  },
                  {
                    label:
                      "The state assures all applicable requirements of 42 CFR 438.66(e) regarding reporting to CMS about the managed care program will be met.",
                    value: "cms-reporting-requirements-met",
                  },
                  {
                    label:
                      "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in MCO/PIHP/PAHP/PCCM/PCCM entity.",
                    value: "beneficiary-support-system-requirements-met",
                  },
                  {
                    label:
                      "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                    value: "mandatory-exempt-groups-identified",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of Section 1905(t) of the Act for PCCMs and PCCM contracts (including for PCCM entities) will be met.",
                    value: "pccm-requirements-met",
                  },
                  {
                    label:
                      "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                    value: "family-planning-freedom-of-choice-met",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    additionalInfo({
      conditionalInfo: sectionDependency.PCCMEntity,
      programLabel: SectionName.PCCMEntity,
    }),
  ],
};
