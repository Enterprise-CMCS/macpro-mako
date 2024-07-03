import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "ABP 2b: Voluntary enrollment assurances for eligibility groups other than the “adult” group under Section 1902(a)(10)(A)(i)(VIII) of the Act",
  formId: "abp2b",
  sections: [
    {
      title: "Assurances",
      sectionId: "addurances",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "adult-eligibility-included",
              descriptionClassName: "text-black text-base",
              descriptionAbove: true,
              description: [
                {
                  text: "These assurances must be made by the state/territory if the Alternative Benefit Plan (ABP) population includes any eligibility groups other than or in addition to the “adult” eligibility group.",
                  type: "default",
                  classname: "block pb-4",
                },
                {
                  text: "When offering voluntary enrollment in an ABP (benchmark or benchmark-equivalent), prior to enrollment, the state/territory will:",
                  type: "default",
                  classname: "font-bold block pt-2",
                },
              ],
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "Inform individuals they are exempt and comply with all requirements related to voluntary enrollment",
                    value:
                      "inform_exempt_and_comply_with_requirements_related_to_voluntary_enrollment",
                  },
                  {
                    styledLabel: [
                      {
                        text: "Effectively inform individuals who voluntarily enroll:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. That enrollment is voluntary",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. That they may disenroll from the ABP at any time and regain immediate access to full standard state/territory plan coverage",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "C. What the process is for disenrolling",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value:
                      "effectively_inform_voluntarily_enroll_and_may_disenroll",
                  },
                  {
                    styledLabel: [
                      {
                        text: "Inform individuals of:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. The benefits available under the ABP",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. The costs of the different benefit packages and a comparison of how the ABP differs from the approved Medicaid state/territory plan",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value:
                      "inform_individuals_of_abp_benefits_and_costs_of_different_packages",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Delivery of information",
      sectionId: "delivery-of-info",
      form: [
        {
          description:
            "How will the state/territory inform individuals about their options for enrollment?",
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Letter",
                    value: "letter",
                  },
                  {
                    label: "Email",
                    value: "email",
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "describe-other-enrollment",
                        label: "Describe",
                        labelClassName: "font-bold",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Upload",
              name: "provide-copy",
              description:
                "Provide a copy of the letter, email, or other communication.",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: { maxFiles: 3 },
            },
            {
              rhf: "Input",
              name: "when-to-inform",
              descriptionAbove: true,
              description:
                "When did/will the state/territory inform the individuals?",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              descriptionClassName: "font-bold text-black",
            },
            {
              rhf: "Textarea",
              name: "process-for-allow-voluntarily-enrolled-to-disenroll",
              descriptionAbove: true,
              description:
                "What is the state/territory's process for allowing voluntarily enrolled individuals to disenroll?",
              descriptionClassName: "font-bold text-black",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Checkbox",
              name: "state-territory-assures-it-will-document-exempt-individuals",
              formItemClassName: "whitespace-pre-wrap",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state/territory assures it will document in the exempt individual's eligibility file that the individual:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. Was informed in accordance with this section prior to enrollment",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. Was given ample time to arrive at an informed choice",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: " C. Chose to enroll in ABP coverage subject to Section 1937 requirements or defined as the state/territory's approved Medicaid state plan not subject to Section 1937 requirements",
                      },
                    ],
                    value:
                      "state_territory_will_document_exempt_individuals_eligibility",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "where-will-info-be-doc",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
              description: "Where will the information be documented?",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "In the eligibility system",
                    value: "in_eligibility_system",
                  },
                  {
                    label: "In the hard copy of the case record",
                    value: "hard_copy_of_case_record",
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "where-will-info-be-doc-describe-other",
                        label: "Describe",
                        labelClassName: "font-bold",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "what-docu-will-be-maintained",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
              description:
                "What documentation will be maintained in the eligibility file?",
              formItemClassName: "border-b-4",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "Copy of correspondence sent to the individual",
                    value: "copy_of_correspondence_sent_to_the_individual",
                  },
                  {
                    label:
                      "Signed documentation from the individual consenting to enrollment in the ABP",
                    value:
                      "signed_documentation_from_individual_consenting_enrollment_ABP",
                  },
                  {
                    label: "Other",
                    value:
                      "what_documentation_will_be_maintained_in_the_eligibility_file_other",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "describe-other-maintained",
                        label: "Describe",
                        labelClassName: "font-bold",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "state-territory-assures-maintain-data",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures it will maintain data that tracks the total number of individuals who have voluntarily enrolled in an ABP and the total number who have disenrolled.",
                    value: "state_territory_assures_it_will_maintain_data",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Additional information",
      sectionId: "addtnl-info",
      form: [
        {
          description:
            "Other information about enrollment assurances for voluntary participants (optional)",
          slots: [
            {
              rhf: "Textarea",
              name: "other-info-about-enroll-assurance",
              rules: {
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
