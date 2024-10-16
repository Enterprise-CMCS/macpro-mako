import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  formId: "cs15",
  header: "CS 15: Separate CHIP MAGI-based income methodologies",
  subheader:
    "2102(b)(1)(B)(v) of the Social Security Act (SSA) and 42 CFR 457.315",
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
          ],
        },
      ],
    },
  ],
};
