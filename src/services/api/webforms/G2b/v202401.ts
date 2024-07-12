import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "Premiums and cost sharing G2b: Cost-sharing amounts—Medically needy individuals",
  subheader: "1916 | 1916A | 42 CFR 447.52 through 447.54",
  formId: "g2b",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing to all medically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
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
              name: "cost-share-same-charge-as-needy",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Is the cost sharing charged to medically needy individuals the same as that charged to categorically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
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
          ],
        },
      ],
    },

    {
      title:
        "Services or items with the same cost-sharing amount for all incomes",
      sectionId: "services-items-same-cost-share-all-incomes",
      subsection: true,
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing to all medically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
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
          ],
        },
      ],
    },

    {
      title: "Services or items with cost-sharing amounts that vary by income",
      sectionId: "services-items-vary-cost-share-all-incomes",
      subsection: true,
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing to all medically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
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
          ],
        },
      ],
    },

    {
      title:
        "Cost sharing for non-preferred drugs charged to otherwise exempt individuals",
      sectionId: "cost-share-for-non-pref-drugs-charged",
      subsection: true,
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing to all medically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
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
          ],
        },
      ],
    },

    {
      title:
        "Cost sharing for non-emergency services provided in the hospital emergency department charged to otherwise exempt individuals",
      sectionId: "cost-share-for-non-emergency-services",
      subsection: true,
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing to all medically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
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
          ],
        },
      ],
    },
  ],
};
