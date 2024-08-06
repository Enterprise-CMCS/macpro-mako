import { FormSchema } from "shared-types";

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
      // dependency: {
      //   conditions: [
      //     {
      //       name: "abp8_delivery-systems_managed-care-delivery-systems",
      //       type: "expectedValue",
      //       expectedValue: "mco",
      //     },
      //   ],
      //   effect: { type: "show" },
      // },
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
  ],
};
