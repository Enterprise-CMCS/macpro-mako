import { FormSchema, RHFSlotProps, Section } from "shared-types";

function sectionId(programLabel: string): string {
  return programLabel.toLowerCase().replace(" ", "-");
}

// Repeating sections ---------------------------------------------------------

// Enum prevents typos and ensures consistency
enum SectionName {
  HIO = "HIO",
  MCO = "MCO",
  PAHP = "PAHP",
  PCCM = "PCCM",
  PCCMEntity = "PCCM entity",
  PIHP = "PIHP",
}
interface sectionParams {
  programLabel: string;
}

function managedCare({ programLabel }: sectionParams): RHFSlotProps[] {
  return [
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
              },
              {
                rhf: "Input",
                label: "Program name",
                labelClassName: "font-bold",
                name: "1915a-program-name",
                props: {
                  className: "w-full",
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
              },
              {
                rhf: "Input",
                label: "Program name",
                labelClassName: "font-bold",
                name: "1915b-program-name",
                props: {
                  className: "w-full",
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
              },
              {
                rhf: "Input",
                label: "Program name",
                labelClassName: "font-bold",
                name: "1932a-program-name",
                props: {
                  className: "w-full",
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
              },
              {
                rhf: "Input",
                label: "Program name",
                labelClassName: "font-bold",
                name: "1115-program-name",
                props: {
                  className: "w-full",
                },
              },
            ],
          },
          {
            label: `An ${programLabel} consistent with applicable managed care requirements (42 CFR Part 438, 42 CFR Part 440, and Sections 1903(m), 1932, and 1937 of the Social Security Act)`,
            value: "consistent-with-requirements",
          },
        ],
      },
    },
  ];
}

// "[Program] procurement or selection"
function procurementOrSelection({ programLabel }: sectionParams): Section {
  return {
    title: `${programLabel} procurement or selection`,
    sectionId: `${sectionId(programLabel)}-procurement`,
    subsection: true,
    form: [
      {
        slots: [
          {
            rhf: "Checkbox",
            name: "procurement-requirments",
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
function deliverySystemCharactaristics({
  programLabel,
}: sectionParams): Section {
  return {
    title: `Other ${programLabel}-based service delivery system characteristics`,
    sectionId: `${sectionId(programLabel)}-service-delivery`,
    subsection: true,
    form: [
      {
        slots: [
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
                name: "benefit-service",
                props: {
                  wrapperClassName:
                    "ml-[0.6rem] pl-4 border-l-4 border-l-primary my-2 space-y-6",
                },
                fields: [
                  {
                    rhf: "Input",
                    label: "Benefit or service",
                    labelClassName: "font-bold",
                    name: "benefit-service",
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
          {
            rhf: "Select",
            label: `Is ${programLabel} service delivery provided on less than a statewide basis?`,
            labelClassName: "font-bold",
            name: "service-delivery",
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
            name: "geographic-area",
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
                      name: "geographic-area",
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
function participationExclusions({ programLabel }: sectionParams): Section {
  return {
    title: `${programLabel} participation exclusions`,
    sectionId: `${sectionId(programLabel)}-participation-exclusions`,
    subsection: true,
    form: [
      {
        slots: [
          {
            rhf: "Select",
            label: `Are individuals excluded from ${programLabel} participation in the ABP?`,
            labelClassName: "font-bold",
            name: "participation-exclusions",
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
                      name: "other-exclusions",
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
function participationRequirements({ programLabel }: sectionParams): Section {
  return {
    title: `General ${programLabel} participation requirements`,
    sectionId: `${sectionId(programLabel)}-participation-requirements`,
    subsection: true,
    form: [
      {
        slots: [
          {
            rhf: "Radio",
            label: "Participation in managed care",
            labelClassName: "font-bold",
            name: "participation-in-managed-care",
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
function disenrollment({ programLabel }: sectionParams): Section {
  return {
    title: "Disenrollment",
    sectionId: "disenrollment",
    subsection: true,
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
          },
          {
            rhf: "Checkbox",
            name: "assures-beneficiary-requests",
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
            props: {
              className: "min-h-[114px]",
            },
          },
          {
            rhf: "Checkbox",
            name: "disenrollment-options",
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
                  value: `submit-requests-to-${sectionId(programLabel)}`,
                },
                {
                  label:
                    "The MCO/HIO/PIHP/PAHP/PCCM/PCCM entity may not approve or disapprove requests and must refer all disenrollment requests received to the state.",
                  value: `${sectionId(programLabel)}-refers-requests`,
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
            props: {
              className: "min-h-[76px]",
            },
          },
          {
            rhf: "Checkbox",
            name: "disenrollment-options",
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
function assurances({ programLabel }: sectionParams): Section {
  return {
    title: "Assurances",
    sectionId: `${sectionId(programLabel)}-assurances`,
    subsection: true,
    form: [
      {
        slots: [
          {
            rhf: "Checkbox",
            name: "assurances",
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
function additionalInfo({ programLabel }: sectionParams): Section {
  return {
    title: `Additional information: ${programLabel}`,
    sectionId: `additional-info-${sectionId(programLabel)}`,
    subsection: true,
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
function payments({ programLabel }: sectionParams): Section {
  return {
    title: `${programLabel} payments`,
    sectionId: `${sectionId(programLabel)}-payments`,
    subsection: true,
    form: [
      {
        slots: [
          {
            rhf: "Checkbox",
            label: "How is payment for services handled?",
            labelClassName: "font-bold",
            name: `${sectionId(programLabel)}-payment`,
            props: {
              options: [
                {
                  label: "Case management fee",
                  value: "case-management-fee",
                },
                {
                  label: "Other",
                  value: "other",
                  slots: [
                    {
                      rhf: "Textarea",
                      label: "Describe",
                      labelClassName: "font-bold",
                      name: "other-payment",
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

// Form schema ----------------------------------------------------------------

export const v202401: FormSchema = {
  header: "ABP 8: Service delivery systems",
  formId: "abp8",
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
              props: {
                options: [
                  { label: "Managed care organization (MCO)", value: "mco" },
                  {
                    label:
                      "Health insuring organization (HIO) (California only)",
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
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "state-territory-complicance",
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
            },
          ],
        },
      ],
    },
    {
      title: "Enrollment process",
      sectionId: "enrollment-process",
      subsection: true,
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
            },
            {
              rhf: "TextDisplay",
              text: "States with voluntary enrollment must have an enrollment choice period or a passive enrollment process where the state enrolls the potential enrollee into a managed care plan, PCCM, or PCCM entity and simultaneously provides a period of time for the enrollee to make an active choice of delivery system.",
              name: "voluntary-enrollment-textdisplay",
            },
            {
              rhf: "Checkbox",
              label:
                "Which of the following will apply to the managed care program?",
              labelClassName: "font-bold",
              name: "voluntary-enrollment-options",
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
              props: {
                className: "min-h-[114px]",
              },
            },
            {
              rhf: "Checkbox",
              name: "mandatory-enrollment-options",
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

    {
      title: "Managed care organizations (MCOs)",
      sectionId: "mco",
      form: [
        {
          slots: managedCare({ programLabel: SectionName.MCO }),
        },
      ],
    },
    procurementOrSelection({ programLabel: SectionName.MCO }),
    deliverySystemCharactaristics({ programLabel: SectionName.MCO }),
    participationExclusions({ programLabel: SectionName.MCO }),
    participationRequirements({ programLabel: SectionName.MCO }),
    disenrollment({ programLabel: SectionName.MCO }),
    assurances({ programLabel: SectionName.MCO }),
    additionalInfo({ programLabel: SectionName.MCO }),

    // HIO --------------------------------------------------------------------

    {
      title: "Health insuring organizations (HIOs)",
      sectionId: "hio",
      form: [
        {
          slots: managedCare({ programLabel: SectionName.HIO }),
        },
      ],
    },
    procurementOrSelection({ programLabel: SectionName.HIO }),
    deliverySystemCharactaristics({ programLabel: SectionName.HIO }),
    participationExclusions({ programLabel: SectionName.HIO }),
    participationRequirements({ programLabel: SectionName.HIO }),
    disenrollment({ programLabel: SectionName.HIO }),
    assurances({ programLabel: SectionName.HIO }),
    additionalInfo({ programLabel: SectionName.HIO }),

    // PIHP -------------------------------------------------------------------

    {
      title: "Prepaid inpatient health plans (PIHPs)",
      sectionId: "pihp",
      form: [
        {
          slots: managedCare({ programLabel: SectionName.PIHP }),
        },
      ],
    },
    procurementOrSelection({ programLabel: SectionName.PIHP }),
    deliverySystemCharactaristics({ programLabel: SectionName.PIHP }),
    participationExclusions({ programLabel: SectionName.PIHP }),
    participationRequirements({ programLabel: SectionName.PIHP }),
    disenrollment({ programLabel: SectionName.PIHP }),
    assurances({ programLabel: SectionName.PIHP }),
    additionalInfo({ programLabel: SectionName.PIHP }),

    // PAHP -------------------------------------------------------------------

    {
      title: "Prepaid ambulatory health plans (PAHPs)",
      sectionId: "pahp",
      form: [
        {
          slots: managedCare({ programLabel: SectionName.PAHP }),
        },
      ],
    },
    procurementOrSelection({ programLabel: SectionName.PAHP }),
    deliverySystemCharactaristics({ programLabel: SectionName.PAHP }),
    participationExclusions({ programLabel: SectionName.PAHP }),
    participationRequirements({ programLabel: SectionName.PAHP }),
    disenrollment({ programLabel: SectionName.PAHP }),
    assurances({ programLabel: SectionName.PAHP }),
    additionalInfo({ programLabel: SectionName.PAHP }),

    // PCCM -------------------------------------------------------------------

    {
      title: "Primary care case management (PCCM)",
      sectionId: "pccm",
      form: [
        {
          slots: managedCare({ programLabel: SectionName.PCCM }),
        },
      ],
    },
    procurementOrSelection({ programLabel: SectionName.PCCM }),
    deliverySystemCharactaristics({ programLabel: SectionName.PCCM }),
    payments({ programLabel: SectionName.PCCM }),
    disenrollment({ programLabel: SectionName.PCCM }),
    assurances({ programLabel: SectionName.PCCM }),
    additionalInfo({ programLabel: SectionName.PCCM }),

    // PCCM entity ------------------------------------------------------------
    {
      title: "PCCM entity",
      sectionId: "pccm-entity",
      form: [
        {
          slots: managedCare({ programLabel: SectionName.PCCMEntity }),
        },
      ],
    },
    deliverySystemCharactaristics({ programLabel: SectionName.PCCMEntity }),
    payments({ programLabel: SectionName.PCCMEntity }),
    disenrollment({ programLabel: SectionName.PCCMEntity }),
    assurances({ programLabel: SectionName.PCCMEntity }),
    additionalInfo({ programLabel: SectionName.PCCMEntity }),
  ],
};
