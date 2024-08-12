import { DependencyRule, RHFOption, RHFSlotProps, Section } from "shared-types";

export enum SectionName {
  HIO = "HIO",
  MCO = "MCO",
  PAHP = "PAHP",
  PCCM = "PCCM",
  PCCMEntity = "PCCM entity",
  PIHP = "PIHP",
}

// Parameters needed to generate a section

export interface SectionDependencyInfo {
  name: string;
  expectedValue: string;
}

interface SectionParams {
  conditionalInfo: SectionDependencyInfo;
  programLabel: string;
  title?: string;
}

// Helper functions -----------------------------------------------------------

// Generate IDs for components
export function createSectionId(programLabel: string): string {
  return programLabel.toLowerCase().replace(" ", "-");
}

// Generate the DependencyRule to show sections
export function generateDependency({
  name,
  expectedValue,
}: {
  name: string;
  expectedValue: string;
}): DependencyRule {
  return {
    conditions: [
      {
        name,
        type: "expectedValue",
        expectedValue,
      },
    ],
    effect: { type: "show" },
  };
}

// Section generators ---------------------------------------------------------

export function managedCare({
  conditionalInfo,
  programLabel,
  title,
}: SectionParams): Section {
  return {
    title: title || `${programLabel}`,
    sectionId: createSectionId(programLabel),
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          {
            rhf: "Select",
            label:
              "Is the managed care delivery system the same as an already approved managed care program?",
            labelClassName: "font-bold",
            name: "same-as-approved-program",
            rules: {
              required: "* Required",
            },
            props: {
              className: "w-[125px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
          {
            rhf: "Checkbox",
            label: "The existing managed care program operates under:",
            labelClassName: "font-bold",
            name: "existing-managed-care-program",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label: "Section 1915(a) voluntary managed care program",
                  value: "1915a",
                  slots: [
                    {
                      rhf: "DatePicker",
                      label: "Date program approved by CMS",
                      labelClassName: "font-bold",
                      name: "1915a-date-approved",
                      rules: {
                        required: "* Required",
                      },
                    },
                    {
                      rhf: "Input",
                      label: "Program name",
                      labelClassName: "font-bold",
                      name: "1915a-program-name",
                      props: {
                        className: "w-full",
                      },
                      rules: {
                        required: "* Required",
                      },
                    },
                  ],
                },
                {
                  label: "Section 1915(b) managed care waiver",
                  value: "1915b",
                  slots: [
                    {
                      rhf: "DatePicker",
                      label: "Date program approved by CMS",
                      labelClassName: "font-bold",
                      name: "1915b-date-approved",
                      rules: {
                        required: "* Required",
                      },
                    },
                    {
                      rhf: "Input",
                      label: "Program name",
                      labelClassName: "font-bold",
                      name: "1915b-program-name",
                      props: {
                        className: "w-full",
                      },
                      rules: {
                        required: "* Required",
                      },
                    },
                  ],
                },
                {
                  label:
                    "Section 1932(a) mandatory managed care state plan amendment",
                  value: "1932a",
                  slots: [
                    {
                      rhf: "DatePicker",
                      label: "Date program approved by CMS",
                      labelClassName: "font-bold",
                      name: "1932a-date-approved",
                      rules: {
                        required: "* Required",
                      },
                    },
                    {
                      rhf: "Input",
                      label: "Program name",
                      labelClassName: "font-bold",
                      name: "1932a-program-name",
                      props: {
                        className: "w-full",
                      },
                      rules: {
                        required: "* Required",
                      },
                    },
                  ],
                },
                {
                  label: "Section 1115 demonstration",
                  value: "1115",
                  slots: [
                    {
                      rhf: "DatePicker",
                      label: "Date program approved by CMS",
                      labelClassName: "font-bold",
                      name: "1115-date-approved",
                      rules: {
                        required: "* Required",
                      },
                    },
                    {
                      rhf: "Input",
                      label: "Program name",
                      labelClassName: "font-bold",
                      name: "1115-program-name",
                      props: {
                        className: "w-full",
                      },
                      rules: {
                        required: "* Required",
                      },
                    },
                  ],
                },
                {
                  label: `A ${programLabel} consistent with applicable managed care requirements (42 CFR Part 438, 42 CFR Part 440, and Sections 1903(m), 1932, and 1937 of the Social Security Act)`,
                  value: "consistent-with-requirements",
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

// "[Program] procurement or selection"
export function procurementOrSelection({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  return {
    title: `${programLabel} procurement or selection`,
    sectionId: `${createSectionId(programLabel)}-procurement`,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          {
            rhf: "Checkbox",
            name: "procurement-requirments",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label:
                    "The state assures all applicable requirements of 45 CFR 75.326 for procurement of contracts will be met.",
                  value: "assures-requirements",
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

// "Other [program]-based service delivery system characteristics"
export function deliverySystemCharactaristics({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  const sectionId = `${createSectionId(programLabel)}_delivery-system`;

  // This part of the section does not appear in PCCM
  const otherCoverage: RHFSlotProps[] =
    programLabel === SectionName.PCCM || programLabel === SectionName.PCCMEntity
      ? []
      : [
          {
            rhf: "Select",
            label: `Will one or more ABP benefits or services be provided through a type of coverage other than the ${programLabel}, such as another managed care plan or fee-for service delivery system?`,
            labelClassName: "font-bold",
            name: "abp-benefits-provided",
            props: {
              className: "w-[125px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
          {
            rhf: "FieldGroup",
            name: "benefit-service",
            label: `Which benefit or service will be provided by a type of coverage other than the ${programLabel}?`,
            labelClassName: "font-bold",
            props: {
              appendText: "Add benefit or service",
              removeText: "Remove",
            },
            fields: [
              {
                rhf: "WrappedGroup",
                name: "benefit-service-group",
                props: {
                  wrapperClassName:
                    "ml-[0.6rem] pl-4 border-l-4 border-l-primary my-2 space-y-6",
                },
                fields: [
                  {
                    rhf: "Input",
                    label: "Benefit or service",
                    labelClassName: "font-bold",
                    name: "benefit-or-service",
                    props: {
                      className: "w-full",
                    },
                  },
                  {
                    rhf: "Textarea",
                    label: "How it will be provided",
                    labelClassName: "font-bold",
                    name: "how-provided",
                    props: {
                      className: "min-h-[76px]",
                    },
                  },
                ],
              },
            ],
          },
        ];

  const PCCMEntityFunctions: RHFSlotProps[] =
    programLabel === SectionName.PCCMEntity
      ? [
          {
            rhf: "Checkbox",
            description:
              "In addition to PCCM services, which function(s) will the entity provide, as defined at 42 CFR 438.2?",
            descriptionClassName: "font-bold",
            descriptionAbove: true,
            name: "delivery-system-characteristics",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label:
                    "Provision of intensive telephonic or face-to-face case management, including operation of a nurse triage advice line",
                  value: "intensive-case-management",
                },
                {
                  label: "Development of enrollee care plans",
                  value: "care-plans",
                },
                {
                  label:
                    "Execution of contracts with and/or oversight responsibilities for the activities of FFS providers in the FFS program",
                  value: "ffs-provider-contracts",
                },
                {
                  label:
                    "Provision of payments to FFS providers on behalf of the state",
                  value: "ffs-provider-payments",
                },
                {
                  label:
                    "Provision of enrollee outreach and education activities",
                  value: "enrollee-outreach",
                },
                {
                  label: "Operation of a customer service call center",
                  value: "customer-service",
                },
                {
                  label:
                    "Review of provider claims, utilization, and practice patterns to conduct provider profiling and/or practice improvement",
                  value: "provider-claims-review",
                },
                {
                  label:
                    "Implementation of quality improvement activities, including administering enrollee satisfaction surveys or collecting data necessary for performance measurement of providers",
                  value: "quality-improvement",
                },
                {
                  label:
                    "Coordination with behavioral health systems/providers",
                  value: "behavioral-health-coordination",
                },
                {
                  label:
                    "Coordination with long-term services and support systems/providers",
                  value: "ltss-coordination",
                },
                {
                  label: "Other",
                  value: "other",
                  slots: [
                    {
                      rhf: "Textarea",
                      label: "Describe",
                      labelClassName: "font-bold",
                      name: "other-description",
                      rules: {
                        required: "* Required",
                      },
                    },
                  ],
                },
              ],
            },
          },
        ]
      : [];

  return {
    title: `Other ${programLabel}-based service delivery system characteristics`,
    sectionId,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          ...otherCoverage,
          ...PCCMEntityFunctions,
          {
            rhf: "Select",
            label: `Is ${programLabel} service delivery provided on less than a statewide basis?`,
            labelClassName: "font-bold",
            name: "service-delivery",
            rules: {
              required: "* Required",
            },
            props: {
              className: "w-[125px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
          {
            rhf: "Radio",
            label: `What is the limited geographic area where ${programLabel} service delivery is available?`,
            labelClassName: "font-bold",
            name: "geographic-area",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label: "Only in designated counties",
                  value: "counties",
                  slots: [
                    {
                      rhf: "Input",
                      label: "Counties",
                      labelClassName: "font-bold",
                      name: "counties",
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
                  label: "Only in designated regions",
                  value: "regions",
                  slots: [
                    {
                      rhf: "Input",
                      label: "Regions and makeup of each",
                      labelClassName: "font-bold",
                      name: "regions",
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
                  label: "Only in designated cities and municipalities",
                  value: "cities",
                  slots: [
                    {
                      rhf: "Input",
                      label: "Cities and municipalities",
                      labelClassName: "font-bold",
                      name: "cities",
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
                    "In some other geographic area (must not be smaller than a zip code)",
                  value: "other-geographic-area",
                  slots: [
                    {
                      rhf: "Input",
                      label: "Geographic area",
                      labelClassName: "font-bold",
                      name: "geographic",
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
        ],
      },
    ],
  };
}

// "[Program] participation exclusions"
export function participationExclusions({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  const sectionId = `${createSectionId(programLabel)}_participation-exclusions`;

  return {
    title: `${programLabel} participation exclusions`,
    sectionId,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          {
            rhf: "Select",
            label: `Are individuals excluded from ${programLabel} participation in the ABP?`,
            labelClassName: "font-bold",
            name: "participation-exclusions",
            rules: {
              required: "* Required",
            },
            props: {
              className: "w-[125px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
          {
            rhf: "Checkbox",
            label: "Excluded individuals",
            labelClassName: "font-bold",
            name: "excluded-individuals",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label: "Individuals with other medical insurance",
                  value: "other-insurance",
                },
                {
                  label: "Individuals eligible for less than three months",
                  value: "less-than-three-months",
                },
                {
                  label:
                    "Individuals in a retroactive period of Medicaid eligibility",
                  value: "retroactive-period",
                },
                {
                  label: "Other",
                  value: "other",
                  slots: [
                    {
                      rhf: "Textarea",
                      label: "Describe",
                      labelClassName: "font-bold",
                      name: "other-exclusions",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        className: "min-h-[76px]",
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
  };
}

// "General [program] participation requirements"
export function participationRequirements({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  return {
    title: `General ${programLabel} participation requirements`,
    sectionId: `${createSectionId(programLabel)}-participation-requirements`,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          {
            rhf: "Radio",
            label: "Participation in managed care",
            labelClassName: "font-bold",
            name: "participation-in-managed-care",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label: "Mandatory",
                  value: "mandatory",
                  slots: [
                    {
                      rhf: "Textarea",
                      label: `Method of enrollment in ${programLabel}s`,
                      name: "mandatory-enrollment-method",
                      labelClassName: "font-bold",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        className: "min-h-[133px]",
                      },
                    },
                  ],
                },
                {
                  label:
                    "Voluntary, using the below method for effectuating enrollment",
                  value: "voluntary",
                  slots: [
                    {
                      rhf: "Radio",
                      name: "voluntary-enrollment-method",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        options: [
                          {
                            label: `Affirmative selection of ${programLabel}`,
                            value: "affirmative-selection",
                          },
                          {
                            label: `State enrolls individual in ${programLabel} (passive enrollment) and permits disenrollment`,
                            value: "passive-enrollment",
                          },
                          {
                            label: "Other",
                            value: "other",
                            slots: [
                              {
                                rhf: "Input",
                                label: "Describe",
                                labelClassName: "font-bold",
                                name: "other-voluntary-enrollment-method",
                                formItemClassName: "w-full",
                                rules: {
                                  required: "* Required",
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
          },
        ],
      },
    ],
  };
}

// "Disenrollment"
export function disenrollment({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  const sectionId = `${createSectionId(programLabel)}_disenrollment`;
  return {
    title: "Disenrollment",
    sectionId: sectionId,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        description:
          "Complete the below based on whether mandatory and/or voluntary enrollment are applicable to your program (see definitions in 42 CFR 438.54(b)).",
        descriptionClassName: "font-normal",
        slots: [
          {
            rhf: "Select",
            label: "Will the state limit disenrollment for managed care?",
            labelClassName: "font-bold",
            name: "limit-disenrollment",
            rules: {
              required: "* Required",
            },
            props: {
              className: "w-[125px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
          {
            rhf: "Input",
            label:
              "Length of time the disenrollment limitation will apply (up to 12 months)",
            labelClassName: "font-bold",
            name: "disenrollment-limit-length",
            props: {
              className: "w-full",
            },
            rules: {
              pattern: {
                value: /^(?:1[0-2]|[1-9])$/,
                message: "Must be a positive integer value up to 12",
              },
              required: "* Required",
            },
          },
          {
            rhf: "Checkbox",
            name: "assures-beneficiary-requests",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label:
                    "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                  value: "assures-requests",
                },
              ],
            },
          },
          {
            rhf: "Textarea",
            label:
              "What is the state’s process for notifying Medicaid beneficiaries of their right to disenroll without cause during the 90 days following the date of their initial enrollment into the MCO/HIO/PAHP/PIHP/PCCM/PCCM entity (e.g., state-generated correspondence, enrollment packet), in accordance with federal requirements including 42 CFR 438.10 and 438.56?",
            labelClassName: "font-bold",
            name: "disenrollment-notification",
            rules: {
              required: "* Required",
            },
            props: {
              className: "min-h-[114px]",
            },
          },
          {
            rhf: "Textarea",
            label:
              "Additional circumstances of cause for disenrollment (optional)",
            labelClassName: "font-bold",
            name: "additional-disenrollment-cause",
            rules: {
              required: "* Required",
            },
            props: {
              className: "min-h-[114px]",
            },
          },
          {
            rhf: "Checkbox",
            name: "disenrollment-options",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label:
                    "The state limits disenrollment and assures it meets the requirements of 42 CFR 438.56(c).",
                  value: "limits-disenrollment",
                },
                {
                  label:
                    "After the initial 90-day enrollment or notice period described in 42 CFR 438.56(c)(2)(i), enrollees may request MCO/HIO/PIHP/PAHP/PCCM/PCCM entity disenrollment every set number of months.",
                  value: "request-disenrollment",
                  slots: [
                    {
                      rhf: "Input",
                      label: "Number of months",
                      labelClassName: "font-bold",
                      name: "disenrollment-number-months",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        icon: "months",
                        iconRight: true,
                      },
                    },
                  ],
                },
                {
                  label:
                    "Enrollees submit disenrollment requests to the state or its agent.",
                  value: "submit-requests",
                },
                {
                  label:
                    "Enrollees submit disenrollment requests to the MCO/HIO/PIHP/PAHP/PCCM/PCCM entity. The managed care plan may approve the request but may not disapprove it.",
                  value: `submit-requests-to-${createSectionId(programLabel)}`,
                },
                {
                  label:
                    "The MCO/HIO/PIHP/PAHP/PCCM/PCCM entity may not approve or disapprove requests and must refer all disenrollment requests received to the state.",
                  value: `${createSectionId(programLabel)}-refers-requests`,
                },
                {
                  label:
                    "Enrollees must seek redress through the MCO/HIO/PIHP/PAHP grievance process before the state will make a determination on the disenrollment request.",
                  value: "seek-redress",
                },
              ],
            },
          },
          {
            rhf: "Textarea",
            label:
              "Describe the “for cause” reasons, if any, that an enrollee may request disenrollment, in addition to those listed in 42 CFR 438.56(d)(2)).",
            labelClassName: "font-bold",
            name: "for-cause-reasons",
            rules: {
              required: "* Required",
            },
            props: {
              className: "min-h-[76px]",
            },
          },
          {
            rhf: "Textarea",
            label:
              "Describe the processes in place to ensure disenrollments are effective no later than the first day of the second month following the month in which the enrollee requests disenrollment or the MCO/PIHP/PAHP/PCCM/PCCM entity refers the request to the state.",
            labelClassName: "font-bold",
            name: "disenrollment-processes",
            rules: {
              required: "* Required",
            },
            props: {
              className: "min-h-[76px]",
            },
          },
          {
            rhf: "Checkbox",
            name: "disenrollment-request",
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label:
                    "The state does not limit disenrollment, and enrollees in MCOs/HIOs/PIHPs/PAHPs/PCCMs/PCCM entities are allowed to disenroll without cause at any time. The disenrollment is effective no later than the first day of the second month following the month in which the enrollee requests disenrollment or the MCO/PIHP/PAHP/PCCM/PCCM entity refers the request to the state.",
                  value: "state-does-not-limit-disenrollment",
                },
                {
                  label:
                    "The state allows MCOs/PIHPs/PAHPs/PCCMs/PCCM entities to request disenrollment of enrollees.",
                  value: "state-allows-disenrollment",
                  slots: [
                    {
                      rhf: "Checkbox",
                      name: "disenrollment-request-options",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        options: [
                          {
                            label:
                              "The MCO/PIHP/PAHP/PCCM/PCCM entity can request disenrollment of an enrollee for certain reasons. \n \n In accordance with 42 CFR 438.56(b), the MCO/PIHP/PAHP/PCCM/PCCM entity may not request disenrollment because of an adverse change in the enrollee's health status or because of the enrollee's utilization of medical services, diminished mental capacity, or uncooperative or disruptive behavior resulting from his or her special needs (except when his or her continued enrollment in the MCO/PIHP/PAHP/PCCM/PCCM entity seriously impairs the entity's ability to furnish services to either this particular enrollee or other enrollees).",

                            value: "can-request-disenrollment",
                            optionlabelClassName: "whitespace-pre-line",
                            slots: [
                              {
                                rhf: "Textarea",
                                label: "List and describe the reasons.",
                                labelClassName: "font-bold",
                                name: "disenrollment-request-reasons",
                                rules: {
                                  required: "* Required",
                                },
                              },
                            ],
                          },
                          {
                            label:
                              "The state reviews and approves all requests for enrollee transfers or disenrollments initiated by MCOs/PIHPs/PAHPS/PCCMs/PCCM entities.",
                            value: "state-reviews-requests",
                          },
                          {
                            label:
                              "If a reassignment is approved, the state notifies the enrollee in a direct and timely manner of the desire of the MCO/PIHP/PAHP/PCCM/PCCM entity to remove the enrollee from its membership or from the PCCM’s caseload.",
                            value: "state-notifies-enrollee",
                          },
                          {
                            label:
                              "The enrollee remains an enrollee of the MCO/PIHP/PAHP/PCCM/PCCM entity until another MCO/PIHP/PAHP/PCCM/PCCM entity is chosen or assigned.",
                            value: "enrollee-remains",
                          },
                        ],
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
  };
}

// "Assurances"
export function assurances({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  return {
    title: "Assurances",
    sectionId: `${createSectionId(programLabel)}-assurances`,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
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
                  value: "assures-requirements",
                },
                {
                  label:
                    "The state assures all applicable requirements of 42 CFR 438.4, 438.5, 438.6, 438.7, 438.8, and 438.74 for payments under any risk contracts will be met.",
                  value: "assures-payments",
                },
                {
                  label:
                    "The state plan program applies the rural exception to choice requirements of 42 CFR 438.52(a) for MCOs in accordance with 42 CFR 438.52(b).",
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
                    "The state assures that, per the requirements at 438.52(c), Medicaid beneficiaries enrolled in an HIO will have a choice between at least two primary care providers within the entity.",
                  value: "assures-choice",
                },
                {
                  label:
                    "The state assures that beneficiary requests for disenrollment (with and without cause) will be permitted in accordance with 42 CFR 438.56.",
                  value: "assures-disenrollment",
                },
                {
                  label:
                    "The state assures the limitations on Medicaid beneficiaries to change between primary care providers will be no more restrictive than the limitations on disenrollment described at 438.56(c).",
                  value: "assures-change",
                },
                {
                  label:
                    "If the state plan so specifies in accordance with 42 CFR 438.56(g), the state assures that the contract provides for automatic reenrollment for a beneficiary who is disenrolled solely because they lose Medicaid eligibility for a period of two months or less.",
                  value: "assures-reenrollment",
                },
                {
                  label:
                    "The state assures all applicable requirements of 42 CFR 438.66(a), (b), and (c) regarding a monitoring system and using data to improve the performance of its managed care program will be met.",
                  value: "assures-monitoring",
                },
                {
                  label:
                    "The state assures all applicable requirements of 42 CFR 438.66(d) regarding readiness assessment will be met.",
                  value: "assures-readiness",
                },
                {
                  label:
                    "The state assures all applicable requirements of 42 CFR 438.66(e) regarding reporting to CMS about the managed care program will be met.",
                  value: "assures-reporting",
                },
                {
                  label:
                    "The state assures it meets all applicable requirements of 42 CFR 438.71 regarding the development and implementation of a beneficiary support system both prior to and after beneficiary enrollment in MCO/HIO/PIHP/PAHP/PCCM/PCCM entity.",
                  value: "assures-support",
                },
                {
                  label:
                    "The state assures it appropriately identifies individuals in the mandatory exempt groups identified in 42 CFR 440.315.",
                  value: "assures-identifies",
                },
                {
                  label:
                    "The state assures all the applicable requirements of 42 CFR regarding freedom of choice for family planning services and supplies defined in Section 1905(a)(4)(C) will be met.",
                  value: "assures-family-planning",
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

// "Additional information: [program]"
export function additionalInfo({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  return {
    title: `Additional information: ${programLabel}`,
    sectionId: `additional-info-${createSectionId(programLabel)}`,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          {
            rhf: "Textarea",
            label:
              "Additional details about this service delivery system (optional)",
            labelClassName: "font-bold",
            name: "additional-details",
            props: {
              className: "min-h-[114px]",
            },
          },
        ],
      },
    ],
  };
}

// "[Program] payments"
export function payments({
  conditionalInfo,
  programLabel,
}: SectionParams): Section {
  const pccmEntityPayment: RHFOption[] =
    programLabel === SectionName.PCCMEntity
      ? [
          {
            label:
              "Shared savings, incentive payments, and/or financial rewards (see 42 CFR 438.310(c)(2))",
            value: "shared-savings",
          },
        ]
      : [];

  return {
    title: `${programLabel} payments`,
    sectionId: `${createSectionId(programLabel)}-payments`,
    subsection: true,
    dependency: generateDependency({
      name: conditionalInfo.name,
      expectedValue: conditionalInfo.expectedValue,
    }),
    form: [
      {
        slots: [
          {
            rhf: "Checkbox",
            label: "How is payment for services handled?",
            labelClassName: "font-bold",
            name: `${createSectionId(programLabel)}-payment`,
            rules: {
              required: "* Required",
            },
            props: {
              options: [
                {
                  label: "Case management fee",
                  value: "case-management-fee",
                },
                ...pccmEntityPayment,
                {
                  label: "Other",
                  value: "other",
                  slots: [
                    {
                      rhf: "Textarea",
                      label: "Describe",
                      labelClassName: "font-bold",
                      name: "other-payment",
                      rules: {
                        required: "* Required",
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
  };
}
