import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  formId: "cs15",
  header: "CS 15: Separate CHIP MAGI-based income methodologies",
  subheader: "2102(b)(1)(B)(v) of the Social Security Act (SSA) and 42 CFR 457.315",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "chip-agency-apply-magi",
              props: {
                options: [
                  {
                    label:
                      "The CHIP agency will apply modified adjusted gross income (MAGI) methodologies for all separate CHIP covered groups, as described below and consistent with 42 CFR 457.315 and 435.603(b) through (i).",
                    value: "true",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
            {
              rhf: "TextDisplay",
              text: "In the case of determining ongoing eligibility for enrollees determined eligible for CHIP on or before December 31, 2013, MAGI-based income methodologies will not be applied until March 31, 2014, or the next regularly scheduled renewal of eligibility, whichever is later.",
              name: "chip-agency-apply-magi-note",
            },
          ],
        },
      ],
    },
    {
      title: "Family size",
      sectionId: "family-size",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Radio",
              name: "family-size-include",
              label:
                "If the state covers pregnant women, in determining family size for the eligibility determination of a pregnant woman, she is counted as herself plus each of the children she is expected to deliver.",
              labelClassName: "text-black",
              description:
                "In determining family size for the eligibility determination of the other individuals in a household that includes a pregnant woman:",
              descriptionAbove: true,
              descriptionClassName: "text-black font-bold",
              props: {
                options: [
                  {
                    label: "The pregnant woman is counted just as herself.",
                    value: "just-as-herself",
                  },
                  {
                    label: "The pregnant woman is counted as herself plus one.",
                    value: "herself-plus-one",
                  },
                  {
                    label:
                      "The pregnant woman is counted as herself plus the number of children she is expected to deliver.",
                    value: "herself-plus-children",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Financial eligibility",
      sectionId: "financial-eligibility",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Radio",
              name: "financial-eligibility-new-applicants",
              label:
                "When determining eligibility for new applicants, financial eligibility is based on current monthly income and family size.",
              labelClassName: "text-black",
              description:
                "When determining eligibility for current beneficiaries, financial eligibility is based on:",
              descriptionAbove: true,
              descriptionClassName: "font-bold",
              props: {
                options: [
                  {
                    label: "Current monthly household income and family size",
                    value: "current-monthly-income",
                  },
                  {
                    label:
                      "Projected annual household income for the remaining months of the current calendar year and family size",
                    value: "projected-annual-income",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Household income",
      sectionId: "household-income",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "state-will-use-reasonable-methods",
              label:
                "In determining current monthly or projected annual household income, the state will use reasonable methods to (optional):",
              labelClassName: "text-black font-bold",
              props: {
                options: [
                  {
                    label:
                      "Include a prorated portion of the reasonably predictable increase in future income and/or family size",
                    value: "prorated-portion",
                  },
                  {
                    label:
                      "Account for a reasonably predictable decrease in future income and/or family size",
                    value: "predictable-decrease",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
            {
              rhf: "Divider",
              name: "divider-1",
              props: {
                wrapperClassName: "border-[#AEB0B5] skinny-border",
              },
            },
            {
              rhf: "Select",
              name: "household-income-includes-cash-support",
              label:
                "Except as provided at 42 CFR 457.315 and 435.603(d)(2) through (d)(4), household income is the sum of the MAGI-based income of every individual included in the individual’s household.",
              labelClassName: "text-black",
              description:
                "Does household income include actually available cash support, exceeding nominal amounts, provided by the person claiming an individual described at 42 CFR 435.603(f)(2)(i) as a tax dependent?",
              descriptionAbove: true,
              descriptionClassName: "font-bold",
              props: {
                options: [
                  {
                    label: "Yes",
                    value: "yes",
                  },
                  {
                    label: "No",
                    value: "no",
                  },
                ],
                className: "w-[125px]",
              },
              rules: {
                required: "* Required",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Assurances",
      sectionId: "assurances",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "chip-agency-certifies",
              props: {
                options: [
                  {
                    label:
                      "The CHIP agency certifies that it has submitted and received approval for the conversion of all separate CHIP covered group income standards to MAGI-equivalent standards.",
                    value: "true",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
            {
              rhf: "Upload",
              name: "upload-approval-documentation",
              label: "Upload approval documentation of converted MAGI-equivalent income standards.",
              labelClassName: "text-black font-bold",
              rules: { required: "* Required" },
              formItemClassName: "pb-16",
            },
          ],
        },
      ],
    },
  ],
};
