import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 7: Benefits assurances",
  formId: "abp7",
  sections: [
    {
      title:
        "Early and Periodic Screening, Diagnostic, and Treatment (EPSDT) assurances",
      sectionId: "epsdt-assurances",
      form: [
        {
          description:
            "If the target population includes persons under 21, complete the following assurances regarding Early and Periodic Screening, Diagnostic, and Treatment (EPSDT). Otherwise, skip to the prescription drug coverage assurances below.",
          descriptionClassName: "font-normal",
          slots: [
            {
              rhf: "Select",
              name: "does-abp-include-beneficiaries-under-21",
              label:
                "Does the Alternative Benefit Plan (ABP) include beneficiaries under age 21?",
              labelClassName: "font-bold",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  {
                    label: "No",
                    value: "no",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "epsdt-services",
              rules: { required: "* Required" },
              dependency: {
                conditions: [
                  {
                    name: "abp7_epsdt-assurances_does-abp-include-beneficiaries-under-21",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: {
                  type: "show",
                },
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that the notice to an individual includes a description of the method for ensuring access to EPSDT services (42 CFR 440.345).",
                    value: "notice-to-individual-includes-description",
                  },
                  {
                    label:
                      "The state/territory assures EPSDT services will be provided to individuals under age 21 who are covered under the state/territory plan under Section 1902(a)(10)(A) of the Act.",
                    value: "provided-to-individuals-under-21",
                  },
                ],
              },
            },
            {
              rhf: "Radio",
              label: "How will EPSDT services be provided?",
              labelClassName: "font-bold",
              name: "how-will-epsdt-be-provided",
              rules: { required: "* Required" },
              dependency: {
                conditions: [
                  {
                    name: "abp7_epsdt-assurances_does-abp-include-beneficiaries-under-21",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: {
                  type: "show",
                },
              },
              props: {
                options: [
                  {
                    label: "Only through an ABP",
                    value: "only_through_abp",
                  },
                  {
                    label:
                      "Through an ABP with additional benefits to ensure EPSDT services as defined in 1905(r)",
                    value: "through_an_abp_with_additional_benefits",
                    form: [
                      {
                        description:
                          "Per 42 CFR 440.345, describe how the additional benefits will be provided, how access to additional benefits will be coordinated, and how beneficiaries and providers will be informed of these processes in order to ensure individuals have access to the full EPSDT benefit.",
                        descriptionClassName: "font-normal",
                        slots: [
                          {
                            rhf: "Radio",
                            label:
                              "How will the state/territory provide additional EPSDT benefits?",
                            labelClassName: "font-bold",
                            name: "how-will-state-territory-provided-additional-benefits",
                            rules: { required: "* Required" },
                            props: {
                              options: [
                                {
                                  label: "Through fee-for-service",
                                  value: "through_fee_for_service",
                                },
                                {
                                  label: "Contracting with a provider",
                                  value: "contracting_with_a_provider",
                                  slots: [
                                    {
                                      rhf: "Radio",
                                      label: "Payment method",
                                      labelClassName: "font-bold",
                                      name: "payment-method",
                                      rules: { required: "* Required" },
                                      props: {
                                        options: [
                                          {
                                            label: "Risk-based capitation",
                                            value: "risk_based_capitation",
                                          },
                                          {
                                            label:
                                              "Administrative services contract",
                                            value:
                                              "administrative_services_contract",
                                          },
                                          {
                                            label: "Other",
                                            value: "other",
                                            slots: [
                                              {
                                                rhf: "Textarea",
                                                name: "payment-other",
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
              },
            },

            {
              rhf: "Input",
              label:
                "Other information about how ESPDT benefits will be provided to participants under age 21 (optional)",
              labelClassName: "font-bold",
              name: "other-info-about-espdt-provided-to-under-21",
              dependency: {
                conditions: [
                  {
                    name: "abp7_epsdt-assurances_does-abp-include-beneficiaries-under-21",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: {
                  type: "show",
                },
              },

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
    {
      title: "Prescription drug coverage assurances",
      sectionId: "perscription-drug-coverage",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that it meets the minimum requirements for prescription drug coverage in Section 1937 of the Act and implementing regulations at 42 CFR 440.347. Coverage is at least the greater of one drug in each United States Pharmacopeia (USP) category and class or the same number of prescription drugs in each category and class as the base benchmark.",
                    value:
                      "assures_min_requirements_for_perscription_drug_coverage",
                  },
                  {
                    label:
                      "The state/territory assures that procedures are in place to allow a beneficiary to request and gain access to clinically appropriate prescription drugs when not covered.",
                    value:
                      "assures_procedures_are_in_place_to_allow_beneficiary_request_and_access_to_prescription_drugs_when_not_covered",
                  },
                  {
                    label:
                      "The state/territory assures that when it pays for outpatient prescription drugs covered under an ABP, it meets the requirements of Section 1927 of the Act and implementing regulations at 42 CFR 440.345, except for those requirements that are directly contrary to amount, duration, and scope of coverage permitted under Section 1937 of the Act.",
                    value:
                      "assures_outpatient_prescription_drugs_coverage_under_abp",
                  },
                  {
                    label:
                      "The state/territory assures that when conducting prior authorization of prescription drugs under an ABP, it complies with prior authorization program requirements in Section 1927(d)(5) of the Act.",
                    value:
                      "assures_prior_authorization_of_drugs_under_abp_prior",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Other benefit assurances",
      sectionId: "other-benefit",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that substituted benefits are actuarially equivalent to the benefits they replaced from the base benchmark plan and that the state/territory has actuarial certification for substituted benefits available for inspection if requested by CMS.",
                    value:
                      "assures_substituted_benefits_are_actuarially_equivalent",
                  },
                  {
                    label:
                      "The state/territory assures that individuals will have access to services in rural health clinics (RHCs) and federally qualified health centers (FQHCs) as defined in subparagraphs (B) and (C) of Section 1905(a)(2) of the Social Security Act.",
                    value:
                      "assures_individuals_access_to_rural_health_clinics_and_federally_qualified_health_centers",
                  },
                  {
                    label:
                      "The state/territory assures that payment for RHC and FQHC services is made in accordance with Section 1902(bb) of the Social Security Act.",
                    value: "assures_payment_for_rhc_and_fqhc",
                  },
                  {
                    label:
                      "The state/territory assures that it will comply with Section 1937(b)(5) of the Act by providing, effective January 1, 2014, to all ABP participants at least essential health benefits as described in Section 1302(b) of the Patient Protection and Affordable Care Act.",
                    value: "assures_comply_with_section_1937b5",
                  },
                  {
                    label:
                      "The state/territory assures that it will comply with the mental health and substance use disorder parity requirements of Section 1937(b)(6) of the Act by ensuring that the financial requirements and treatment limitations applicable to mental health or substance use disorder benefits comply with Section 2705(a) of the Public Health Service Act in the same manner as such requirements apply to a group health plan.",
                    value:
                      "assures_compliy_with_mental_healthy_and_substance_use_disorder",
                  },
                  {
                    label:
                      "The state/territory assures that it will comply with Section 1937(b)(7) of the Act by ensuring that benefits provided to ABP participants include, for any individual described in Section 1905(a)(4)(C), medical assistance for family planning services and supplies in accordance with such section.",
                    value: "assures_comply_with_section_1937b7",
                  },
                  {
                    label:
                      "The state/territory assures emergency and non-emergency transportation for individuals enrolled in an ABP in accordance with 42 CFR 431.53.",
                    value: "assures_emergency_and_non_emergency_transport",
                  },
                  {
                    label:
                      "The state/territory assures, in accordance with 45 CFR 156.115(a)(4) and 45 CFR 147.130, that it will provide as essential health benefits a broad range of preventive services including: “A” and “B” services recommended by the United States Preventive Services Task Force; vaccines recommended by the Advisory Committee for Immunization Practices (ACIP); preventive care and screening for infants, children, and adults recommended by HRSA's Bright Futures program; and additional preventive services for women recommended by the Institute of Medicine (IOM).",
                    value:
                      "assures_accordance_with_CFR_it_will_provide_essential_health_benefits",
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
