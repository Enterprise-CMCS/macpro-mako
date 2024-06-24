import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "Premiums and cost sharing G3: Limitations",
  formId: "g3",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              name: "state-admin-prem-and-cost-share-in-accordance",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state administers premiums and cost sharing in accordance with the limitations described at 42 CFR 447.56, as well as at 1916(a)(2) and (j) and 1916A(b) of the Social Security Act (SSA).",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    { title: "Exemptions", sectionId: "exemptions", form: [] },

    {
      title: "Groups of individuals—Mandatory exemptions",
      sectionId: "exemptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "cost-shar-less-than-agency-pays",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state assures that it does not impose cost sharing on the following groups:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Groups of individuals—Optional exemptions",
      sectionId: "exemptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "cost-shar-less-than-agency-pays",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state assures that it does not impose cost sharing on the following groups:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Services—Mandatory exemptions",
      sectionId: "exemptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "cost-shar-less-than-agency-pays",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state assures that it does not impose cost sharing on the following groups:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Enforceability of exemptions",
      sectionId: "exemptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "cost-shar-less-than-agency-pays",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state assures that it does not impose cost sharing on the following groups:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Payments to providers",
      sectionId: "cost-shar-for-non-emergency",
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-shar-for-non-emergen-in-hospital",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state impose cost sharing for non-emergency services provided in a hospital emergency department?",
              labelClassName: "font-bold",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },

            {
              name: "ensures-provide-non-emergenc-impose-cost-shar",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    styledLabel: [
                      {
                        text: "The state ensures that before providing non-emergency services and imposing cost sharing for such services, the hospitals providing care:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Conduct an appropriate medical screening under 42 CFR 489.24, Subpart G to determine that the individual does not need emergency services",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Inform the individual of the amount of his or her cost-sharing obligation for non-emergency services provided in the emergency department",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Provide the individual with the name and location of an available and accessible alternative non-emergency services provider",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Determine that the alternative provider can provide services to the individual in a timely manner with the imposition of a lesser cost-sharing amount or no cost sharing if the individual is otherwise exempt from cost sharing",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Provide a referral to coordinate scheduling for treatment by the alternative provider",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "assures-process-identi-hospital-service-as-non-emergenc",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state assures it has a process in place to identify hospital emergency department services as non-emergency for the purpose of imposing cost sharing. This process does not limit a hospital's obligations for screening and stabilizing treatment of an emergency medical condition under Section 1867 of the Act or modify any obligations under either state or federal standards relating to the application of a prudent-layperson standard for payment or coverage of emergency medical services by any MCO.",
                  },
                ],
              },
            },
            {
              name: "assures-describe",
              rhf: "Textarea",
              rules: { required: "* Required" },
              label: "Describe the process.",
              labelClassName: "font-bold",
              formItemClassName: "pl-9",
            },
          ],
        },
      ],
    },

    {
      title: "Payments to managed care organizations (MCOs)",
      sectionId: "addtnl-info",
      form: [
        {
          description: "Other relevant information (optional)",
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              rules: {
                pattern: {
                  value: /^\S(.*\S)?$/,
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
      title: "Aggregate limits",
      sectionId: "addtnl-info",
      form: [
        {
          description: "Other relevant information (optional)",
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              rules: {
                pattern: {
                  value: /^\S(.*\S)?$/,
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
  ],
};
