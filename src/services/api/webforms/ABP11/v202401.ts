import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 11: Payment methodology",
  formId: "abp11",
  sections: [
    {
      title: "Alternative Benefit Plans - Payment methodologies",
      sectionId: "abp-pay-method",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurance-method-in-plan",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state or territory provides assurance that, for each benefit provided under an Alternative Benefit Plan that is not provided through managed care, it will use the payment methodology in its approved state plan or hereby submits state plan amendment Attachment 4.19a, 4.19b, or 4.19d, as appropriate, describing the payment methodology for the benefit.",
                    value: "assures_alternative_benefit_plan_in_accordance",
                  },
                ],
              },
            },
            {
              rhf: "Upload",
              name: "state-plan-attchmnt-alt-payment-method",
              label: "State plan amendment attachment",
              labelClassName: "font-bold",
              description:
                "Only required if not using the payment methodology in the approved state plan",
              descriptionAbove: true,
              props: { maxFiles: 3 },
            },
          ],
        },
      ],
    },
  ],
};
