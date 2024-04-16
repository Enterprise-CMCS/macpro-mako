import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 4: Alternative Benefit Plan cost sharing",
  sections: [
    {
      title: "Cost sharing",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "abp4_cost-sharing_applies-to-abp_checkgroup",
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
              name: "abp4_cost-sharing_abp-for-individuals-income-over-100-poverty_select",
              label:
                "The ABP for individuals with income over 100% of the federal poverty level (FPL) includes cost sharing other than that described in Attachment 4.18-A or G1, G2a, G2b, G2c, and G3.",
              labelStyling: "font-bold",
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
              rhf: "Checkbox",
              name: "abp4_cost-sharing_see-approved-attachment_checkgroup",
              rules: { required: "* Required" },
              formItemStyling: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "abp4_cost-sharing_abp-for-individuals-income-over-100-poverty_select",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              props: {
                options: [
                  {
                    label:
                      "See approved Attachment 4.18-F or G for description..",
                    value: "true",
                  },
                ],
              },
            },
            {
              rhf: "Upload",
              name: "abp4_cost-sharing_attachment_upload",
              label: "Attachment 4.18-F or G",
              labelStyling: "font-bold",
              rules: { required: "* Required" },
              formItemStyling: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "abp4_cost-sharing_abp-for-individuals-income-over-100-poverty_select",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },
            {
              rhf: "Textarea",
              name: "abp4-cost-sharing_other-info-about-requirements_textarea",
              label:
                "Other information about cost-sharing requirements (optional)",
              labelStyling: "font-bold",
            },
          ],
        },
      ],
    },
  ],
};
