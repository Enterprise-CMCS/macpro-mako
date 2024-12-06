import { FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

export const v202401: FormSchema = {
  header: "ABP 4: Alternative Benefit Plan cost sharing",
  formId: "abp4",
  sections: [
    {
      title: "Cost sharing",
      sectionId: "cost-sharing",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "applies-to-abp",
              description:
                "Attachment 4.18-A or G may be revised to include cost sharing for ABP services that are not otherwise described in the state plan. Any such cost sharing must comply with Section 1916 of the Social Security Act.",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "Any cost sharing described in Attachment 4.18-A or G applies to the Alternative Benefit Plan (ABP).",
                    value: "true",
                  },
                ],
              },
            },
            {
              rhf: "Select",
              name: "abp-for-individuals-income-over-100-poverty",
              label:
                "The ABP for individuals with income over 100% of the federal poverty level (FPL) includes cost sharing other than that described in Attachment 4.18-A or G1, G2a, G2b, G2c, and G3.",
              labelClassName: "font-bold",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "WrappedGroup",
              name: "wrapped",
              props: {
                wrapperClassName: "ml-[0.6rem] px-4 border-l-4 border-l-primary pb-6",
              },
              dependency: {
                conditions: [
                  {
                    name: "abp4_cost-sharing_abp-for-individuals-income-over-100-poverty",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              fields: [
                {
                  rhf: "Checkbox",
                  name: "see-approved-attachment",
                  rules: { required: "* Required" },
                  props: {
                    options: [
                      {
                        label: "See approved Attachment 4.18-F or G for description.",
                        value: "true",
                      },
                    ],
                  },
                },
                {
                  rhf: "Upload",
                  name: "attachment_upload",
                  label: "Attachment 4.18-F or G",
                  labelClassName: "font-bold",
                  rules: { required: "* Required" },
                },
              ],
            },
            {
              rhf: "Textarea",
              name: "other-info-about-requirements",
              label: "Other information about cost-sharing requirements (optional)",
              labelClassName: "font-bold",
              rules: {
                pattern: {
                  value: noLeadingTrailingWhitespace,
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
