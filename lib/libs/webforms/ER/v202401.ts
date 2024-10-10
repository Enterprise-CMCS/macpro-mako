import { DefaultFieldGroupProps, FormGroup, FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils";

const childStyle = " ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary ";
const wrappedGroupSpacing = " space-y-6 ";

const a1DropdownOptions = [
  {
    value: "cfr-425-220",
    label:
      "Optional Coverage of Parents and Other Caretaker Relatives (1902(a)(10)(A)(ii)(I)/42 CFR §435.220)",
  },
  {
    value: "cfr-435-222",
    label:
      "Reasonable classifications of individuals under age 21 (1902(a)(10)(A)(ii)(I) and (IV)/42 CFR §435.222)",
  },
  {
    value: "cfr-435-227",
    label:
      "Children with non-IV-E adoption assistance (1902(a)(10)(A)(ii)(VIII)/42 CFR §42 CFR 435.227)",
  },
  {
    value: "cfr-435-226",
    label:
      "Independent foster care adolescents (1902(a)(10)(A)(ii)(XVII)/42 CFR §435.226)",
  },
  {
    value: "cfr-435-229",
    label:
      "Optional targeted low-income children (1902(a)(10)(A)(ii)(XIV) and 1905(u)(2)(B)/42 CFR §435.229)",
  },
  {
    value: "cfr-435-218",
    label:
      "Individuals above 133% FPL under age 65 (1902(a)(10)(A)(ii)(XX) and 1902(hh)/42 CFR §435.218)",
  },
  {
    value: "cfr-435-213",
    label:
      "Individuals needing treatment for breast or cervical cancer (1902(a)(10)(A)(ii)(XVIII) and 1902(aa)/42CFR §435.213)",
  },
  {
    value: "cfr-435-",
    label:
      "Individuals eligible for family planning services (1902(a)(10)(A)(ii)(XXI) and 1902(ii) clause (XVI) in the matter following 1902(a)(10)(G)/42 CFR §§435.214 and 435.603(k))",
  },
  {
    value: "cfr-435-215",
    label:
      "Individuals with tuberculosis (1902(a)(10)(A)(ii)(XII) and 1902(z)/42 CFR §435.215)",
  },
  {
    value: "cobra-1902",
    label:
      "Individuals electing COBRA continuation coverage (1902(a)(10)(F), 1902(u)(1) and 1902(a)(10)(XII))",
  },
  {
    value: "cfr-435-210-230",
    label:
      "Individuals eligible for but not receiving cash assistance (1902(a)(10)(A)(ii)(I), 1902(v), 1905(a)/42 CFR §§435.210, 435.230 and 436.210) ",
  },
  {
    value: "cfr-435-211",
    label:
      "Individuals eligible for cash except for institutionalization (1902(a)(10)(A)(ii)(IV), 1905(a)/42 CFR §§435.211 and 436.211)",
  },
  {
    value: "cfr-435-232-234",
    label:
      "Optional state supplement beneficiaries (1902(a)(10)(A)(ii)(IV), 1902(a)(10)(A)(ii)(XI)/42 CFR §§435.232 and 435.234) ",
  },
  {
    value: "cfr-435-236",
    label:
      "Individuals in institutions eligible under a special income level (1902(a)(10)(A)(ii)(V)//42 CFR §§435.236)",
  },
  {
    value: "hospice-1905",
    label:
      "Individuals receiving hospice (1902(a)(10)(A)(ii)(VII) and 1905(o))",
  },
  {
    value: "cfr-435-225",
    label:
      "Children under age 19 with a disability (1902(e)(3)/42 CFR §435.225)",
  },
  {
    value: "age-disability-1902",
    label:
      "Age and disability-related poverty level (1902(a)(10)(A)(ii)(X) and 1902(m)(1)) ",
  },
  { value: "work-1902", label: "Work incentives (1902(a)(10)(A)(ii)(XIII))" },
  {
    value: "ticket-work-1902",
    label: "Ticket to work basic (1902(a)(10)(A)(ii)(XV))",
  },
  {
    value: "ticket-medical-1902",
    label: "Ticket to work medical improvements (1902(a)(10)(A)(ii)(XVI))",
  },
  {
    value: "familt-act-1902",
    label:
      "Family Opportunity Act children with a disability (1902(a)(10)(A)(ii)(XIX) and 1902(cc))",
  },
  {
    value: "cfr-435-219",
    label:
      "Individuals receiving state plan home and community-based services (1902(a)(10)(A)(ii)(XXII) and 1915(i)/42 CFR §§435.219 and 436.219)",
  },
  {
    value: "cfr-435-219-otherwise-eligible",
    label:
      "Individuals receiving state plan home and community-based services who are otherwise eligible for HCBS waivers  (1902(a)(10)(A)(ii)(XXII) and 1915(i)/42 CFR §435.219 and 436.219)",
  },
];

const a2DroppdownOptionsIncome = [
  {
    value: "65-plus-blind-disability",
    label:
      "Individuals who are age 65 or older or who have blindness or a disability",
  },
  { value: "qual-med-ben", label: "Qualified medicare beneficiaries " },
  {
    value: "spec-low-income",
    label: "Specified low-income medicare beneficiaries",
  },
  { value: "qual-ind", label: "Qualifying individuals" },
  {
    value: "ind-eligible-not-recieving-cash",
    label: "Individuals eligible for but not receiving cash assistance ",
  },
  {
    value: "eligible-cash-institutionalized",
    label: "Individuals eligible for cash except for institutionalization",
  },
  {
    value: "home-comm-waiver-institution",
    label:
      "Individuals receiving home and community-based waiver services under institutional rules",
  },
  { value: "pace", label: "PACE participants " },
  {
    value: "age-disability-poverty",
    label: "Age and disability-related poverty level ",
  },
  { value: "work-inc", label: "Work incentives " },
  { value: "ticket-work", label: "Ticket to work basic " },
  { value: "ticket-med", label: "Ticket to work medical improvements " },
  {
    value: "foa-disability",
    label: "Family Opportunity Act children with a disability ",
  },
  {
    value: "state-plan-comm-serv",
    label: "Individuals receiving state plan home and community-based services",
  },
  { value: "med-needy-pregnant", label: "Medically needy pregnant women" },
  {
    value: "med-needy-children",
    label: "Medically needy children under age 18",
  },
  {
    value: "med-needy-under-21",
    label:
      "Medically needy reasonable classifications of individuals under age 21",
  },
  {
    value: "med-needy-parents",
    label: "Medically needy parents and other caretaker relatives",
  },
  {
    value: "med-needy-pop",
    label: "Medically needy populations based on age, blindness, or disability",
  },
];
const a2DroppdownOptionsResource = [
  {
    value: "65-plus-blind-disability",
    label:
      "Individuals who are age 65 or older or who have blindness or a disability",
  },
  { value: "qual-med-ben", label: "Qualified medicare beneficiaries " },
  {
    value: "spec-low-income",
    label: "Specified low-income medicare beneficiaries",
  },
  { value: "qual-ind", label: "Qualifying individuals" },
  {
    value: "ind-eligible-not-recieving-cash",
    label: "Individuals eligible for but not receiving cash assistance ",
  },
  {
    value: "eligible-cash-institutionalized",
    label: "Individuals eligible for cash except for institutionalization",
  },
  {
    value: "home-comm-waiver-institution",
    label:
      "Individuals receiving home and community-based waiver services under institutional rules",
  },
  {
    value: "special-inc-level",
    label: "Individuals in institutions eligible under a special income level",
  },
  { value: "pace", label: "PACE participants " },
  {
    value: "age-disability-poverty",
    label: "Age and disability-related poverty level ",
  },
  { value: "work-inc", label: "Work incentives " },
  { value: "ticket-work", label: "Ticket to work basic " },
  { value: "ticket-medical", label: "Ticket to work medical improvements " },
  {
    value: "foa-disability",
    label: "Family Opportunity Act children with a disability ",
  },
  {
    value: "state-plan-comm-serv",
    label: "Individuals receiving state plan home and community-based services",
  },
  { value: "med-needy-pregnant", label: "Medically needy pregnant women" },
  {
    value: "med-needy-children",
    label: "Medically needy children under age 18",
  },
  {
    value: "med-needy-under-21",
    label:
      "Medically needy reasonable classifications of individuals under age 21",
  },
  {
    value: "med-needy-parents",
    label: "Medically Needy parents and other caretaker relatives",
  },
  {
    value: "med-needy-pop",
    label: "Medically needy populations based on age, blindness or, disability",
  },
];

const b1DropdownOptions = [
  {
    value: "65-plus-blind-disability",
    label:
      "Individuals in 209(b) states who are age 65 or older or who have blindness or a disability",
  },
  { value: "qual-med-ben", label: "Qualified medicare beneficiaries" },
  {
    value: "qual-disabled-working",
    label: "Qualified disabled and working individuals ",
  },
  {
    value: "spec-low-income",
    label: "Specified low-income medicare beneficiaries",
  },
  { value: "qual-ind", label: "Qualifying individuals" },
  {
    value: "ind-eligible-not-recieving-cash",
    label: "Individuals eligible for but not receiving cash assistance",
  },
  {
    value: "eligible-cash-institutionalized",
    label: "Individuals eligible for cash except for institutionalization",
  },
  {
    value: "special-inc-level",
    label: "Individuals in institutions eligible under a special income level",
  },
  { value: "pace", label: "PACE participants" },
  {
    value: "age-disability-poverty",
    label: "Age and disability-related poverty level",
  },
  { value: "work-incentive", label: "Work incentives" },
  { value: "ticket-medical-imp", label: "Ticket to work medical improvements" },
  {
    value: "foa-disability",
    label: "Family Opportunity Act children with a disability",
  },
  {
    value: "state-plan-home-comm-serv",
    label: "Individuals receiving state plan home and community-based services",
  },
  {
    value: "med-needy-pregnant",
    label: "Medically needy pregnant individuals",
  },
  {
    value: "med-needy-children",
    label: "Medically needy children under age 18",
  },
  {
    value: "med-needy-under-21",
    label:
      "Medically needy reasonable classifications of individuals under age 21",
  },
  {
    value: "med-needy-parents",
    label: "Medically needy parents and other caretaker relatives",
  },
  {
    value: "med-needy-pop",
    label: "Medically needy populations based on age, blindness, or disability",
  },
];
const b2DropdownOptions = [
  { value: "infants", label: "Infants and children under age 19" },
  { value: "parents", label: "Parents and other caretaker relatives" },
  { value: "pregnant", label: "Pregnant individuals" },
  { value: "foster", label: "Former foster care children" },
  { value: "adult", label: "Adult (if covered by state)" },
  {
    value: "133-fpl-65",
    label: "Individuals above 133% FPL under age 65 (if covered by state)",
  },
  {
    value: "family-planning",
    label:
      "Individuals eligible for family planning services (if covered by state)",
  },
  {
    value: "breat-cervical-cancer",
    label:
      "Individuals needing treatment for breast or cervical cancer (if covered by state)",
  },
];

const e1DropdownOptions = [
  { value: "per-diem", label: "Per diem" },
  { value: "drg", label: "DRG" },
  { value: "rugs", label: "RUGS" },
  { value: "pdpm", label: "PDPM" },
  { value: "bundled-payment", label: "Bundled payment" },
  { value: "fee-schedule", label: "Fee schedule" },
  { value: "pmpm", label: "PMPM" },
  { value: "pps", label: "PPS" },
  { value: "apm", label: "APM" },
  { value: "air", label: "AIR" },
  { value: "cost-based", label: "Cost-based rate" },
  { value: "reconciled", label: "Reconciled cost reimbursement" },
  { value: "supplemental", label: "Supplemental" },
  { value: "other", label: "Other" },
];

const effectivePeriodSectionChildren = (letter: string): FormGroup[] => {
  return [
    {
      slots: [
        {
          name: `${letter}-sec-eff-date`,
          rhf: "Select",
          rules: {
            required: "* Required",
          },
          labelClassName: "font-bold text-black",
          label:
            "Do the effective date and end date for the options elected in this section match the period described above?",
          props: {
            className: "w-32",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
        },
      ],
    },
    {
      dependency: {
        conditions: [
          {
            expectedValue: "no",
            name: `ers_effective-period_${letter}-sec-eff-date`,
            type: "expectedValue",
          },
        ],
        effect: { type: "show" },
      },
      wrapperClassName: childStyle,
      slots: [
        {
          name: `${letter}-sec-effective-date`,
          rhf: "DatePicker",
          label: "Section effective date",
          labelClassName: "font-bold text-black",
          props: { className: "w-60" },
          rules: {
            required: "* Required",
          },
        },
        {
          name: `${letter}-sec-end-date`,
          label: "Section end date",
          rhf: "Radio",
          labelClassName: "font-bold text-black",
          rules: {
            required: "* Required",
          },
          props: {
            options: [
              {
                value: "end_of_emergency",
                label: "End of public health emergency",
              },
              {
                value: "other_date",
                label: "Other date",
                slots: [
                  {
                    name: `${letter}-sec-effective-end-date`,
                    rhf: "DatePicker",
                    label: "End date",
                    labelClassName: "font-bold text-black",
                    props: { className: "w-60" },
                    rules: {
                      required: "* Required",
                    },
                  },
                ],
              },
              {
                value: "other_event",
                label: "Other event or circumstance",
                slots: [
                  {
                    name: `${letter}-sec-describe-event`,
                    label: "Describe",
                    rhf: "Textarea",
                    labelClassName: "font-bold text-black",
                    props: {
                      className: "h-[76px]",
                    },
                    rules: {
                      required: "* Required",
                      pattern: {
                        value: noLeadingTrailingWhitespace,
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
  ];
};

export const v202401: FormSchema = {
  formId: "ers",
  header: "Section 7 - General provisions",
  subheader: "Emergency relief during a public health emergency",
  sections: [
    {
      sectionId: "gen-info",
      title: "General Information",
      form: [
        {
          slots: [
            {
              name: "pub-health-response",
              label:
                "To which public health emergency is this emergency relief state plan amendment (SPA) a response?",
              rhf: "Textarea",
              labelClassName: "font-bold text-black",
              props: {
                className: "h-[76px]",
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              name: "add-prev-spa",
              rhf: "Radio",
              label:
                "Does this SPA add to a previously approved emergency relief SPA in effect?",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                    slots: [
                      {
                        name: "append-spa-id",
                        rhf: "Input",
                        label: "SPA ID",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-56" },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  { value: "no", label: "No" },
                ],
              },
            },
            {
              name: "supersede-prev-spa",
              rhf: "Radio",
              label:
                "Does this SPA supersede a previously approved emergency relief SPA?",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                    slots: [
                      {
                        name: "super-spa-id",
                        rhf: "Input",
                        label: "SPA ID",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-56" },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  { value: "no", label: "No" },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "effective-period",
      subsection: true,
      title: "Effective period",
      form: [
        {
          description:
            "If a Section 1135 waiver is requested with this SPA submission, the SPA period must comply with the limitations applicable to Section 1135 waivers.",
          descriptionClassName: "font-normal text-black",
          slots: [
            {
              name: "spa-effective-date",
              rhf: "DatePicker",
              label: "SPA effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "spa-end-date",
              label: "SPA end date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "spa-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              name: "sections-modified",
              rhf: "Checkbox",
              label:
                "Sections modified during the period of the public health emergency",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "eligibility",
                    label: "A - Eligibility",
                    form: effectivePeriodSectionChildren("a"),
                  },
                  {
                    value: "enrollment",
                    label: "B - Enrollment",
                    form: effectivePeriodSectionChildren("b"),
                  },
                  {
                    value: "cost_sharing",
                    label: "C - Cost sharing and premiums",
                    form: effectivePeriodSectionChildren("c"),
                  },
                  {
                    value: "benefits",
                    label: "D - Benefits",
                    form: effectivePeriodSectionChildren("d"),
                  },
                  {
                    value: "payment",
                    label: "E - Payment",
                    form: effectivePeriodSectionChildren("e"),
                  },
                  {
                    value: "post_eligibile_treatment_income",
                    label: "F - Post-eligibility treatment of income",
                    form: effectivePeriodSectionChildren("f"),
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "a-eligible",
      sectionWrapperClassname: "bg-gray-100",
      title: "A - Eligibility",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "options-elected",
              label: "Options elected",
              labelClassName: "font-bold text-black",
              props: {
                options: [
                  {
                    value: "1-medical_assistance",
                    label:
                      "1. Expand medical assistance to optional groups during the public health emergency.",
                  },
                  {
                    value: "2-finance_method",
                    label:
                      "2. Apply less restrictive financial methodologies to individuals excepted from financial methodologies based on modified adjusted gross income (MAGI).",
                  },
                  {
                    value: "3-residency_out_of_state",
                    label:
                      "3. Establish residency for individuals temporarily out of state due to a public health emergency.",
                  },
                  {
                    value: "4-residency_visitors",
                    label:
                      "4. Extend residency to individuals who may be considered residents of other states.",
                  },
                  {
                    value: "5-good_faith",
                    label:
                      "5. Extend the reasonable opportunity period (ROP) for noncitizens making a good faith effort to verify status.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "a-options-elected",
      subsection: true,
      title: "A - Eligibility options elected",
      dependency: {
        conditions: [
          { type: "valueExists", name: "ers_a-eligible_options-elected" },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "1. Expand medical assistance to optional groups that are not already covered in the state plan during the public health emergency.",
          dependency: {
            conditions: [
              {
                expectedValue: "1-medical_assistance",
                type: "expectedValue",
                name: "ers_a-eligible_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              text: "Optional eligibility group(s) to which the agency provides medical assistance during the period of the public health emergency",
              name: "test-desc",
            },
            {
              rhf: "Select",
              name: "add-medical-needy-cov",
              label: "Does the state want to add medically needy coverage?",
              labelClassName: "text-black font-bold",
              rules: { required: "* Required" },
              props: {
                className: "w-36",
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
              },
            },
            {
              rhf: "WrappedGroup",
              name: "child-wrapper-needy",
              props: {
                wrapperClassName: childStyle + wrappedGroupSpacing,
              },
              dependency: {
                conditions: [
                  {
                    expectedValue: "yes",
                    type: "expectedValue",
                    name: "ers_a-options-elected_add-medical-needy-cov",
                  },
                ],
                effect: { type: "show" },
              },
              fields: [
                {
                  rhf: "Select",
                  name: "cover-mandatory-needy",
                  label:
                    "Does the state already cover all mandatory medically needy groups (medically needy pregnant individuals, medically needy children under age 18, and protected medically needy individuals who were eligible in 1973?",
                  labelClassName: "text-black font-bold",
                  rules: { required: "* Required" },
                  props: {
                    className: "w-36",
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
                  },
                },
                {
                  name: "yes-wrapped-needy",
                  rhf: "WrappedGroup",
                  props: {
                    wrapperClassName: childStyle + wrappedGroupSpacing,
                  },
                  dependency: {
                    conditions: [
                      {
                        expectedValue: "yes",
                        type: "expectedValue",
                        name: "ers_a-options-elected_cover-mandatory-needy",
                      },
                    ],
                    effect: { type: "show" },
                  },
                  fields: [
                    {
                      rhf: "Checkbox",
                      name: "addtnl-needy-covered",
                      label:
                        "Which additional group(s) does the state want to add to medically needy coverage?",
                      labelClassName: "text-black font-bold",
                      rules: { required: "* Required" },
                      props: {
                        options: [
                          {
                            value: "under-21",
                            label:
                              "Medically needy reasonable classifications of individuals under age 21",
                          },
                          {
                            value: "parents-caretakers",
                            label:
                              "Medically needy parents and other caretaker relatives",
                          },
                          {
                            value: "age-blind-disability",
                            label:
                              "Medically needy populations based on age, blindness, or disability",
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  name: "no-wrapped-needy",
                  rhf: "WrappedGroup",
                  props: {
                    wrapperClassName: childStyle + wrappedGroupSpacing,
                  },
                  dependency: {
                    conditions: [
                      {
                        expectedValue: "no",
                        type: "expectedValue",
                        name: "ers_a-options-elected_cover-mandatory-needy",
                      },
                    ],
                    effect: { type: "show" },
                  },
                  fields: [
                    {
                      rhf: "Checkbox",
                      name: "assure-provide-coverage",
                      rules: { required: "* Required" },
                      props: {
                        options: [
                          {
                            value: "assured",
                            styledLabel:
                              "The state assures that it will provide coverage to all mandatory medically needy groups, including medically needy pregnant individuals, medically needy children under age 18, and protected medically needy individuals who were eligible in 1973.",
                          },
                        ],
                      },
                    },
                    {
                      rhf: "Checkbox",
                      name: "addtnl-needy-covered",
                      label:
                        "Which additional group(s) does the state want to add to medically needy coverage? (optional)",
                      labelClassName: "text-black font-bold",
                      description:
                        "All mandatory medically needy groups must be covered if additional medically needy groups will be covered.",
                      descriptionAbove: true,
                      props: {
                        options: [
                          {
                            value: "under-21",
                            label:
                              "Medically needy reasonable classifications of individuals under age 21",
                          },
                          {
                            value: "parents-caretakers",
                            label:
                              "Medically needy parents and other caretaker relatives",
                          },
                          {
                            value: "age-blind-disability",
                            label:
                              "Medically needy populations based on age, blindness, or disability",
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              rhf: "Select",
              name: "add-medical-pace-cov",
              label:
                "Does the state want to add coverage for individuals receiving home and community-based waiver services and/or for PACE (individuals receiving home and community based services under institutional rules, 42 CFR 435.217) participants?",
              labelClassName: "text-black font-bold",
              description:
                "The state must cover individuals receiving home and community-based waiver services under institutional rules (42 CFR 435.217) if also electing to cover PACE participants.",
              descriptionAbove: true,
              rules: { required: "* Required" },
              props: {
                className: "w-36",
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
              },
            },
            {
              rhf: "WrappedGroup",
              name: "child-wrapper-pace",
              props: {
                wrapperClassName: childStyle + wrappedGroupSpacing,
              },
              dependency: {
                conditions: [
                  {
                    expectedValue: "yes",
                    type: "expectedValue",
                    name: "ers_a-options-elected_add-medical-pace-cov",
                  },
                ],
                effect: { type: "show" },
              },
              fields: [
                {
                  rhf: "Select",
                  name: "cover-home-comm-services",
                  label:
                    "Does the state already cover individuals receiving home and community-based waiver services?",
                  labelClassName: "text-black font-bold",
                  rules: { required: "* Required" },
                  props: {
                    className: "w-36",
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
                  },
                },
                {
                  name: "want-pace-coverage",
                  rhf: "Select",
                  rules: { required: "* Required" },
                  label: "Does the state want to cover PACE participants?",
                  labelClassName: "text-black font-bold",
                  dependency: {
                    conditions: [
                      {
                        expectedValue: "yes",
                        type: "expectedValue",
                        name: "ers_a-options-elected_cover-home-comm-services",
                      },
                    ],
                    effect: { type: "show" },
                  },
                  props: {
                    className: "w-36",
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
                  },
                },
                {
                  name: "no-wrapped-pace",
                  rhf: "WrappedGroup",
                  props: {
                    wrapperClassName: childStyle + wrappedGroupSpacing,
                  },
                  dependency: {
                    conditions: [
                      {
                        expectedValue: "no",
                        type: "expectedValue",
                        name: "ers_a-options-elected_cover-home-comm-services",
                      },
                    ],
                    effect: { type: "show" },
                  },
                  fields: [
                    {
                      rhf: "Checkbox",
                      name: "assure-provide-home-comm-coverage",
                      rules: { required: "* Required" },
                      props: {
                        options: [
                          {
                            value: "assured",
                            styledLabel:
                              "The state assures that it will provide coverage to individuals receiving home and community-based waiver services.",
                          },
                        ],
                      },
                    },
                    {
                      name: "want-pace-coverage",
                      rhf: "Select",
                      rules: { required: "* Required" },
                      label: "Does the state want to cover PACE participants?",
                      labelClassName: "text-black font-bold",
                      props: {
                        className: "w-36",
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
                      },
                    },
                  ],
                },
              ],
            },
            {
              rhf: "Multiselect",
              name: "other-opt-eligibility-groups",
              label: "Other optional eligibility groups",
              labelClassName: "text-black font-bold",
              props: {
                options: a1DropdownOptions,
              },
            },
            {
              rhf: "Textarea",
              name: "addtnl-info-1905a-standards",
              label:
                "Additional information about income/resource standard and populations described in Section 1905(a) of the Act (optional)",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description:
            "2. Apply less restrictive financial methodologies to individuals excepted from financial methodologies based on modified adjusted gross income (MAGI).",
          dependency: {
            conditions: [
              {
                expectedValue: "2-finance_method",
                type: "expectedValue",
                name: "ers_a-eligible_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "a2-desc",
              text: "The agency applies the following additional less restrictive financial methodologies not currently included in the state plan during the period of the public health emergency to individuals excepted from financial methodologies based on MAGI:",
            },
            {
              rhf: "Checkbox",
              name: "adjusted-methodologies",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "income",
                    label: "Income methodologies",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "income-methodology",
                        label:
                          "What are the less restrictive income methodologies applied by the agency?",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        labelClassName: "text-black font-bold",
                        props: { className: "h-[76px]" },
                      },
                      {
                        rhf: "WrappedGroup",
                        name: "income-wrapped",
                        props: {
                          wrapperClassName: childStyle + wrappedGroupSpacing,
                        },
                        fields: [
                          {
                            rhf: "Multiselect",
                            name: "income-eligibility-groups",
                            label:
                              "Eligibility groups to which the less restrictive income methodologies are applied",
                            labelClassName: "text-black font-bold",
                            rules: { required: "* Required" },
                            props: { options: a2DroppdownOptionsIncome },
                          },
                          {
                            rhf: "Textarea",
                            name: "addtnl-income-info",
                            label:
                              "Additional information about applicable methodology if more than one is provided and/or a 1905(a) population to which the methodology is limited (optional)",
                            labelClassName: "text-black font-bold",
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    value: "resource",
                    label: "Resource methodologies",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "resource-methodology",
                        label:
                          "What are the less restrictive resource methodologies applied by the agency?",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        labelClassName: "text-black font-bold",
                        props: { className: "h-[76px]" },
                      },
                      {
                        rhf: "WrappedGroup",
                        name: "resource-wrapped",
                        props: {
                          wrapperClassName: childStyle + wrappedGroupSpacing,
                        },
                        fields: [
                          {
                            rhf: "Multiselect",
                            name: "resource-eligibility-groups",
                            label:
                              "Eligibility groups to which the less restrictive resource methodologies are applied",
                            labelClassName: "text-black font-bold",
                            rules: { required: "* Required" },
                            props: { options: a2DroppdownOptionsResource },
                          },
                          {
                            rhf: "Textarea",
                            name: "addtnl-resource-info",
                            label:
                              "Additional information about applicable methodology if more than one is provided and/or a 1905(a) population to which the methodology is limited (optional)",
                            labelClassName: "text-black font-bold",
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          description:
            "3. Establish residency for individuals temporarily out of state due to a public health emergency.",
          dependency: {
            conditions: [
              {
                expectedValue: "3-residency_out_of_state",
                type: "expectedValue",
                name: "ers_a-eligible_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "a3-desc",
              text: "The agency considers individuals who are evacuated from the state, who leave the state for medical reasons related to the public health emergency, or who are otherwise absent from the state due to the public health emergency and who intend to return to the state to continue to be residents of the state under 42 CFR 435.403(j)(3).",
            },
          ],
        },
        {
          description:
            "4. Extend residency to individuals who may be considered residents of other states.",
          dependency: {
            conditions: [
              {
                expectedValue: "4-residency_visitors",
                type: "expectedValue",
                name: "ers_a-eligible_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Textarea",
              name: "desc-non-residents",
              label:
                "To which nonresident individuals living in the state during the public health emergency does the agency provide Medicaid coverage?",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              labelClassName: "text-black font-bold",
              props: { className: "h-[76px]" },
            },
          ],
        },
        {
          description:
            "5. Extend the reasonable opportunity period (ROP) for noncitizens making a good faith effort to verify status.",
          dependency: {
            conditions: [
              {
                expectedValue: "5-good_faith",
                type: "expectedValue",
                name: "ers_a-eligible_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "a5-desc",
              text: "The agency provides for an extension of the reasonable opportunity period for noncitizens declaring to be in a satisfactory immigration status if the noncitizen is making a good faith effort to resolve any inconsistencies or obtain any necessary documentation or if the agency is unable to complete the verification process within the 90-day reasonable opportunity period due to the public health emergency.",
            },
          ],
        },
      ],
    },
    {
      sectionId: "b-enrollment",
      sectionWrapperClassname: "bg-gray-100",
      title: "B - Enrollment",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "options-elected",
              label: "Options elected",
              labelClassName: "font-bold text-black",
              props: {
                options: [
                  {
                    value: "1-modify_agency_eligibility",
                    label:
                      "1. Modify the agency’s approved hospital presumptive eligibility program.",
                  },
                  {
                    value: "2-designate_agency",
                    label:
                      "2. Designate an agency as a qualified entity for presumptive eligibility.",
                  },
                  {
                    value: "3-designate_entities",
                    label:
                      "3. Designate additional qualified entities for presumptive eligibility.",
                  },
                  {
                    value: "4-adopt_children_eligibility",
                    label: "4. Adopt continuous eligibility for children.",
                  },
                  {
                    value: "5-redetermination_period",
                    label:
                      "5. Extend the redetermination period for individuals excepted from the MAGI-based financial methodologies.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "b-options-elected",
      subsection: true,
      title: "B - Enrollment options elected",
      dependency: {
        conditions: [
          { type: "valueExists", name: "ers_b-enrollment_options-elected" },
          {
            type: "notOnlyBadValue",
            name: "ers_b-enrollment_options-elected",
            expectedValue: "5-redetermination_period",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "1. Modify the agency’s approved hospital presumptive eligibility program.",
          dependency: {
            conditions: [
              {
                expectedValue: "1-modify_agency_eligibility",
                type: "expectedValue",
                name: "ers_b-enrollment_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "b1-desc",
              text: "The agency elects to make the following changes to its program allowing hospitals to make presumptive eligibility determinations in accordance with Section 1902(a)(47)(B) of the Act and 42 CFR 435.1110:",
            },
            {
              rhf: "Multiselect",
              name: "non-magi-groups",
              rules: { required: "* Required" },
              label:
                "Non-MAGI groups covered under the state plan for which hospitals are allowed to make presumptive eligibility determinations",
              labelClassName: "font-bold text-black",
              props: {
                options: b1DropdownOptions,
              },
            },
            {
              rhf: "Checkbox",
              name: "nonmagi-eligibility-mods",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "sec-1115-presumptions",
                    label:
                      "Allow hospitals to make presumptive eligibility determinations for certain populations covered in approved Section 1115 demonstration(s).",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "sec-1115-adttnl-desc",
                        label: "Populations",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                  {
                    value: "limits-not-in-plan",
                    label:
                      "Establish reasonable limits on the number of presumptive eligibility periods allowed, which are different from the reasonable limits otherwise approved in the state plan.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "limits-adttnl-desc",
                        label: "Reasonable limits",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                  {
                    value: "performance-standards",
                    label:
                      "Modify the performance standards for participating hospitals.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "performance-standards-adttnl-desc",
                        label: "Modification(s)",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                  {
                    value: "residency-required",
                    label:
                      "Attestation of state residency is required as a condition of presumptive eligibility.",
                  },
                  {
                    value: "citizenship-required",
                    label:
                      "Attestation of United States citizenship/eligible noncitizen status is required as a condition of presumptive eligibility.",
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "b1-adttnl-desc",
              label: "Additional information (optional)",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[114px]",
              },
            },
          ],
        },
        {
          description:
            "2. Designate the state agency as a qualified entity for presumptive eligibility.",
          dependency: {
            conditions: [
              {
                expectedValue: "2-designate_agency",
                type: "expectedValue",
                name: "ers_b-enrollment_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "b2-desc",
              text: "The agency designates itself as a qualified entity for purposes of making presumptive eligibility determinations described below in accordance with Sections 1920, 1920A, 1920B, and 1920C of the Act.",
            },
            {
              rhf: "Multiselect",
              name: "b2-magi-groups",
              rules: { required: "* Required" },
              label:
                "State plan MAGI groups to which presumptive eligibility may be applied",
              labelClassName: "font-bold text-black",
              props: {
                options: b2DropdownOptions,
              },
            },
            {
              rhf: "Checkbox",
              rules: { required: "* Required" },
              name: "b2-magi-eligibility-mods",
              props: {
                options: [
                  {
                    value: "self-delegation",
                    label:
                      "The agency delegates itself/the state agency as a qualified entity for presumptive eligibility.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "self-delegation-adttnl-desc",
                        label: "Describe",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                  {
                    value: "reasonable-limits",
                    label:
                      "Reasonable limits are applied to the number of authorized presumptive eligibility periods, which differ from those otherwise approved under the state plan.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "reasonable-limits-adttnl-desc",
                        label: "Reasonable limits",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                  {
                    value: "residency-required",
                    label:
                      "Attestation of state residency is required as a condition of presumptive eligibility.",
                  },
                  {
                    value: "citizenship-required",
                    label:
                      "Attestation of United States citizenship/eligible noncitizen status is required as a condition of presumptive eligibility.",
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "b2-adttnl-desc",
              label: "Additional information (optional)",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[114px]",
              },
            },
          ],
        },
        {
          description:
            "3. Designate additional qualified entities for presumptive eligibility.",
          dependency: {
            conditions: [
              {
                expectedValue: "3-designate_entities",
                type: "expectedValue",
                name: "ers_b-enrollment_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "b3-desc",
              text: "The agency designates entities as qualified to make presumptive eligibility determinations or adds additional populations as described below in accordance with Sections 1920, 1920A, 1920B, and 1920C of the Act and 42 CFR 435(L).",
            },
            {
              rhf: "Textarea",
              rules: { required: "* Required" },
              name: "entities-desginated-qualified",
              label:
                "Entities designated as qualified to make presumptive eligibility determinations",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
            {
              rhf: "Multiselect",
              name: "b3-magi-groups",
              rules: { required: "* Required" },
              label:
                "State plan MAGI groups to which presumptive eligibility may be applied",
              labelClassName: "font-bold text-black",
              props: {
                options: b2DropdownOptions,
              },
            },
            {
              rhf: "Checkbox",
              rules: { required: "* Required" },
              name: "b3-magi-eligibility-mods",
              props: {
                options: [
                  {
                    value: "reasonable-limits",
                    label:
                      "Reasonable limits are applied to the number of authorized presumptive eligibility periods, which differ from those otherwise approved under the state plan.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "b3-reasonable-limits-adttnl-desc",
                        label: "Reasonable limits",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                  {
                    value: "residency-required",
                    label:
                      "Attestation of state residency is required as a condition of presumptive eligibility.",
                  },
                  {
                    value: "citizenship-required",
                    label:
                      "Attestation of United States citizenship/eligible noncitizen status is required as a condition of presumptive eligibility.",
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "b3-adttnl-desc",
              label: "Additional information (optional)",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[114px]",
              },
            },
          ],
        },
        {
          description:
            "4. Extend the redetermination period for individuals excepted from the MAGI-based financial methodologies.",
          dependency: {
            conditions: [
              {
                expectedValue: "4-adopt_children_eligibility",
                type: "expectedValue",
                name: "ers_b-enrollment_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "b4-desc",
              text: "The agency conducts redeterminations of eligibility for individuals excepted from MAGI-based financial methodologies under 42 C.F.R. § 435.603(j) once every period in accordance with 42 C.F.R. § 435.916(b).",
            },
            {
              rhf: "Input",
              name: "length-of-period",
              label: "",
              labelClassName: "",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^([1-9]|1[01])$/,
                  message: "Value must be between 1 and 11.",
                },
              },
              props: {
                className: "w-72",
                iconRight: true,
                icon: "months",
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "c-costshare",
      sectionWrapperClassname: "bg-gray-100",
      title: "C - Cost sharing and premiums",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "options-elected",
              label: "Options elected",
              labelClassName: "font-bold text-black",
              props: {
                options: [
                  {
                    value: "1-suspend_deductibles",
                    label:
                      "1. Suspend deductibles, copayments, coinsurance, and other cost-sharing charges.",
                  },
                  {
                    value: "2-reduce_deductibles",
                    label:
                      "2. Reduce deductibles, copayments, coinsurance, and other cost-sharing charges.",
                  },
                  {
                    value: "3-suspend_enrollment_fees",
                    label:
                      "3. Suspend enrollment fees, premiums, and similar charges.",
                  },
                  {
                    value: "4-reduce_enrollment_fees",
                    label:
                      "4. Reduce enrollment fees, premiums, and similar charges.",
                  },
                  {
                    value: "5-hardship_waiver",
                    label:
                      "5. Establish an undue hardship waiver for payment of enrollment fees, premiums, and similar charges.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "c-options-elected",
      subsection: true,
      title: "C - Cost sharing and premiums options elected",
      dependency: {
        conditions: [
          { type: "valueExists", name: "ers_c-costshare_options-elected" },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "1. Suspend deductibles, copayments, coinsurance, and other cost-sharing charges.",
          dependency: {
            conditions: [
              {
                expectedValue: "1-suspend_deductibles",
                type: "expectedValue",
                name: "ers_c-costshare_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Radio",
              name: "suspension-amount",
              label: "Suspension of cost-sharing",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "agency_suspends_all",
                    label: "The agency suspends all cost-sharing charges.",
                  },
                  {
                    value: "agency_suspends_some",
                    label: "The agency suspends certain cost-sharing charges.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "suspension_some_desc",
                        label: "Describe",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          description:
            "2. Reduce deductibles, copayments, coinsurance, and other cost-sharing charges.",
          dependency: {
            conditions: [
              {
                expectedValue: "2-reduce_deductibles",
                type: "expectedValue",
                name: "ers_c-costshare_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Textarea",
              rules: { required: "* Required" },
              name: "how-reduce-cs",
              label: "How does the agency reduce cost sharing?",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description:
            "3. Suspend enrollment fees, premiums, and similar charges.",
          dependency: {
            conditions: [
              {
                expectedValue: "3-suspend_enrollment_fees",
                type: "expectedValue",
                name: "ers_c-costshare_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Radio",
              name: "suspension-beneficiaries",
              label:
                "The agency suspends enrollment fees, premiums, and similar charges for:",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "all_ben",
                    label: "All beneficiaries",
                  },
                  {
                    value: "some_ben",
                    label: "The agency suspends certain cost-sharing charges.",
                    slots: [
                      {
                        rhf: "Textarea",
                        rules: { required: "* Required" },
                        name: "some-ben-desc",
                        label: "Describe",
                        labelClassName: "text-black font-bold",
                        props: {
                          className: "h-[76px]",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          description:
            "4. Reduce enrollment fees, premiums, and similar charges. ",
          dependency: {
            conditions: [
              {
                expectedValue: "4-reduce_enrollment_fees",
                type: "expectedValue",
                name: "ers_c-costshare_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Textarea",
              rules: { required: "* Required" },
              name: "how-reduce-fess-premiums-sc",
              label:
                "How does the agency reduce enrollment fees, premiums, and similar charges?",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description:
            "5. Establish an undue hardship waiver for payment of enrollment fees, premiums, and similar charges.",
          dependency: {
            conditions: [
              {
                expectedValue: "5-hardship_waiver",
                type: "expectedValue",
                name: "ers_c-costshare_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "c5-desc",
              text: "The agency allows waiver of payment of the enrollment fee, premiums, and similar charges for undue hardship.",
            },
            {
              rhf: "Textarea",
              rules: { required: "* Required" },
              name: "unique-hardship-standards",
              label:
                "What are the standards and/or criteria for determining undue hardship?",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "d-benefits",
      sectionWrapperClassname: "bg-gray-100",
      title: "D - Benefits",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "options-elected",
              label: "Options elected",
              labelClassName: "font-bold text-black",
              dependency: {
                looseConditions: true,
                conditions: [
                  {
                    type: "expectedValue",
                    name: "ers_d-benefits_options-elected",
                    expectedValue: "1-benefits_add_opt_1905",
                  },
                  {
                    type: "expectedValue",
                    name: "ers_d-benefits_options-elected",
                    expectedValue: "2-benefits_adj_1905_1915",
                  },
                ],
                effect: {
                  type: "setValue",
                  checkUnique: true,
                  fieldName: "ers_d-benefits_options-elected",
                  newValue: ["4-compliance_reqs", "5-abp_applicable_opts"],
                },
              },
              props: {
                options: [
                  {
                    value: "1-benefits_add_opt_1905",
                    styledLabel: [
                      "1. Benefits - temporarily add optional 1905(a) benefit(s)",
                      {
                        type: "br",
                        classname: "italic",
                        text: "If selected, options D4, D5, and E1 must also be completed.",
                      },
                    ],
                  },
                  {
                    value: "2-benefits_adj_1905_1915",
                    styledLabel: [
                      "2. Benefits - temporarily adjust covered 1905(a), 1915(j), 1915(k), and/or 1945 benefit(s)",
                      {
                        type: "br",
                        classname: "italic",
                        text: "If selected, options D4, D5, and E1 must also be completed.",
                      },
                    ],
                  },
                  {
                    value: "3-temp_adj_1915",
                    label:
                      "3. Benefits - temporarily adjust the 1915(i) benefit",
                  },
                  {
                    value: "4-compliance_reqs",
                    styledLabel: [
                      "4. Benefits - attestation of compliance with existing requirements for new and adjusted benefits",
                      {
                        type: "br",
                        classname: "italic",
                        text: "Required if D1 and/or D2 are selected",
                      },
                    ],
                  },
                  {
                    value: "5-abp_applicable_opts",
                    styledLabel: [
                      "5. Alternative Benefit Plan (ABP) - applicability of options 1 and/or 2 to approved ABPs",
                      {
                        type: "br",
                        classname: "italic",
                        text: "Required if D1 and/or D2 are selected",
                      },
                    ],
                  },
                  {
                    value: "6-telehealth",
                    label:
                      "6. Telehealth - extend coverage of services provided via telehealth (may not be needed if there is nothing in the approved state plan prohibiting coverage of services provided via telehealth)",
                  },
                  {
                    value: "7-pharm_adj_supplies",
                    label:
                      "7. Pharmacy - adjust days’ supply or quantity limits",
                  },
                  {
                    value: "8-pharm_mod_auth",
                    label: "8. Pharmacy - modify prior authorizations",
                  },
                  {
                    value: "9-pharm_add_payment",
                    label:
                      "9. Pharmacy - add supplement payment to professional dispensing fee",
                  },
                  {
                    value: "10-pharm_establish",
                    label:
                      "10. Pharmacy - establish preferred drug list (PDL) exceptions",
                  },
                  {
                    value: "11-pharm_waive_sig",
                    label: "11. Pharmacy - waive signature requirement(s)",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "d-options-elected",
      subsection: true,
      dependency: {
        looseConditions: true,
        conditions: [
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "1-benefits_add_opt_1905",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "2-benefits_adj_1905_1915",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "3-temp_adj_1915",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "4-compliance_reqs",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "5-abp_applicable_opts",
          },
        ],
        effect: { type: "show" },
      },
      title: "D - Benefits options elected",
      form: [
        {
          description:
            "1. Benefits—temporarily add optional 1905(a) benefit(s)",
          dependency: {
            conditions: [
              {
                expectedValue: "1-benefits_add_opt_1905",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d1-desc-a",
              text: [
                {
                  text: "Optional 1905(a) benefits the agency adds to its state plan",
                  type: "bold",
                },
              ],
            },
            {
              rhf: "TextDisplay",
              name: "d1-desc-b",
              text: "Do not add CPT codes for telehealth. Instead, use option 5.",
            },
            {
              rhf: "FieldArray",
              name: "d1-benefit-array",
              descriptionAbove: true,
              formItemClassName: childStyle,
              props: {
                appendText: "Add benefit",
                appendVariant: "default",
                divider: true,
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
              },
              fields: [
                {
                  rhf: "Input",
                  name: "ben-name",
                  label: "Benefit name",
                  labelClassName: "text-black font-bold",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "service-scope",
                  label: "Service description and amount, duration, and scope",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "allowable-provider-types",
                  label: "Allowable provider types and qualifications",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
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
        {
          description:
            "2. Benefits—temporarily adjust covered 1905(a), 1915(j), 1915(k), and/or 1945 benefit(s)",
          dependency: {
            conditions: [
              {
                expectedValue: "2-benefits_adj_1905_1915",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d2-desc-a",
              text: [
                {
                  text: "Adjustments to 1905(a), 1915(j), 1915(k), and/or 1945 benefits the agency currently covers in the state plan",
                  type: "bold",
                },
              ],
            },
            {
              rhf: "TextDisplay",
              name: "d2-desc-b",
              text: "Do not include 1915(i), telehealth, or the drug benefits here. For 1915(i), use option 3. For telehealth, use option 6. For drug benefits, use options 7, 8, 9, 10, and 11.",
            },
            {
              rhf: "FieldArray",
              name: "d2-benefit-array",
              descriptionAbove: true,
              formItemClassName: childStyle,
              props: {
                appendText: "Add benefit",
                appendVariant: "default",
                divider: true,
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
              },
              fields: [
                {
                  rhf: "Input",
                  name: "ben-name",
                  label: "Benefit name",
                  labelClassName: "text-black font-bold",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "Legal-provs",
                  label: "Federal legal provision",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "service-scope",
                  label:
                    "Service description and/or amount, duration, and scope changes",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "prov-qual-changes",
                  label: "Changes to provider qualification changes",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "assessment-consent-plan-policies",
                  label:
                    "Changes to assessment, consent, and service plan policies",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "other",
                  label: "Other changes",
                  labelClassName: "text-black font-bold",
                  props: { className: "h-[76px]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
              ],
            },
            {
              rhf: "Checkbox",
              label: "Adjustments to state plan prior authorization",
              labelClassName: "text-black font-bold",
              name: "d2-plan-adjustments",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "suspend-all-services",
                    label:
                      "Suspend prior authorization for all covered services.",
                  },
                  {
                    value: "suspend-some-services",
                    label:
                      "Suspend prior authorization for certain covered services.",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "suspend-some-desc",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        props: { className: "h-[76px]" },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  {
                    value: "extend-all-existing-auths",
                    label:
                      "Extend pre-existing authorizations of all covered services for which a beneficiary has previously received prior authorization.",
                  },
                  {
                    value: "extend-some-existing-auths",
                    label:
                      "Extend pre-existing authorizations for certain covered services for which a beneficiary has previously received prior authorization.",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "extend-some-auths-desc",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        props: { className: "h-[76px]" },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
        {
          description: "3. Benefits—temporarily adjust the 1915(i) benefit",
          dependency: {
            conditions: [
              {
                expectedValue: "3-temp_adj_1915",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d3-desc-a",
              text: [
                {
                  text: "New services added to existing 1915(i) benefit(s)",
                  type: "bold",
                },
              ],
            },
            {
              rhf: "FieldArray",
              name: "d3-service-array",
              descriptionAbove: true,
              formItemClassName: childStyle,
              props: {
                appendText: "Add benefit",
                appendVariant: "default",
                divider: true,
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
              },
              fields: [
                {
                  rhf: "Input",
                  name: "ben-name",
                  label: "1915(i) benefit name",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Input",
                  name: "service-name",
                  label: "Service name",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  rhf: "Textarea",
                  name: "service-def",
                  label: "Service definitions, including scope",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                  props: { className: "h-[76px]" },
                },
                {
                  rhf: "Textarea",
                  name: "addtnl-needs",
                  label:
                    "Additional needs-based criteria for receiving the service, if applicable (optional)",
                  labelClassName: "font-bold text-black",
                  props: { className: "h-[76px]" },
                },
                {
                  rhf: "Checkbox",
                  name: "service-scope-limits",
                  descriptionAbove: true,
                  label:
                    "Specify limits, if any, on the amount, duration, or scope of this service. ",
                  description:
                    "Per 42 CFR Section 440.240, services available to any categorically needy recipient cannot be less in amount, duration, and scope than those services available to a medically needy recipient, and services must be equal for any individual within a group. States must also separately address standard state plan service questions related to sufficiency of services.",
                  labelClassName: "font-bold text-black",
                  rules: { required: "* Required" },
                  props: {
                    options: [
                      {
                        value: "limits-cat-needy",
                        label: "Limits for categorically needy recipients",
                        slots: [
                          { rhf: "Textarea", name: "limits-cat-needy-desc" },
                        ],
                      },
                      {
                        value: "limits-med-needy",
                        label: "Limits for medically needy recipients",
                        slots: [
                          { rhf: "Textarea", name: "limits-med-needy-desc" },
                        ],
                      },
                    ],
                  },
                },
                {
                  rhf: "TextDisplay",
                  name: "d3-desc-b",
                  text: [
                    {
                      text: "Provider qualification information",
                      type: "bold",
                    },
                  ],
                },
                {
                  rhf: "TextDisplay",
                  name: "d3-desc-b",
                  text: "One or more qualifications must be specified.",
                },
                {
                  rhf: "FieldArray",
                  name: "provider-type-arr",
                  props: {
                    appendText: "Add provider type",
                    divider: true,
                    appendVariant: "default",
                    fieldArrayClassName:
                      DefaultFieldGroupProps.fieldArrayClassName,
                  },
                  formItemClassName: childStyle,
                  fields: [
                    {
                      rhf: "Input",
                      name: "provider-type",
                      label: "Provider type",
                      labelClassName: "font-bold text-black",
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: noLeadingTrailingWhitespace,
                          message:
                            "Must not have leading or trailing whitespace.",
                        },
                      },
                    },
                    {
                      rhf: "WrappedGroup",
                      name: "provider-lic-cert-wrap",
                      label: "Provider qualification",
                      labelClassName: "font-bold text-black",
                      props: { wrapperClassName: "flex space-x-6" },
                      fields: [
                        {
                          rhf: "Input",
                          name: "license",
                          label: "License",
                          labelClassName: "font-bold text-black",
                          props: { className: "w-60" },
                          rules: {
                            required: "* Required",
                            pattern: {
                              value: noLeadingTrailingWhitespace,
                              message:
                                "Must not have leading or trailing whitespace.",
                            },
                          },
                        },
                        {
                          rhf: "Input",
                          name: "certification",
                          label: "Certification",
                          props: { className: "w-60" },
                          labelClassName: "font-bold text-black",
                          rules: {
                            required: "* Required",
                            pattern: {
                              value: noLeadingTrailingWhitespace,
                              message:
                                "Must not have leading or trailing whitespace.",
                            },
                          },
                        },
                      ],
                    },
                    {
                      rhf: "Textarea",
                      name: "other-standard",
                      label: "Other standard",
                      labelClassName: "font-bold text-black",
                      props: { className: "h-[76px]" },
                    },
                    {
                      rhf: "TextDisplay",
                      name: "d3-desc-c",
                      text: [
                        {
                          type: "bold",
                          text: "Verification of provider qualifications",
                        },
                      ],
                    },
                    {
                      rhf: "Input",
                      name: "verification-entity",
                      label: "Entity responsible for verification",
                      labelClassName: "font-bold text-black",
                      props: { className: "w-60" },
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: noLeadingTrailingWhitespace,
                          message:
                            "Must not have leading or trailing whitespace.",
                        },
                      },
                    },
                    {
                      rhf: "Input",
                      name: "verification-freq",
                      label: "Frequency of verification",
                      labelClassName: "font-bold text-black",
                      props: { className: "w-60" },
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: noLeadingTrailingWhitespace,
                          message:
                            "Must not have leading or trailing whitespace.",
                        },
                      },
                    },
                  ],
                },
                {
                  rhf: "Checkbox",
                  name: "service-prov-opts",
                  label: "Service provider",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "legal-resp",
                        label: "Legally responsible person",
                      },
                      { value: "relative", label: "Relative/legal guardian" },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "service-delivery-opts",
                  label: "Service delivery method",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      { value: "participant", label: "Participant-directed" },
                      { value: "provider", label: "Provider-managed" },
                      { value: "telehealth", label: "Remote/via telehealth" },
                    ],
                  },
                },
              ],
            },
            {
              rhf: "TextDisplay",
              name: "d3-desc-c",
              text: [
                {
                  type: "bold",
                  text: "Adjustments made to existing Section 1915(i) benefit(s)",
                },
              ],
            },
            {
              rhf: "Input",
              name: "d3-1915-i-ben-name",
              label: "1915(i) benefit name",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Input",
              name: "1915-i-service-name",
              label: "Service name",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Checkbox",
              name: "change-description-opts",
              label: "Describe changes made (must choose at least one)",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "serv-desc",
                    label: "Changes to service description",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "service-desc-change-desc",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: { className: "h-[76px]" },
                      },
                    ],
                  },
                  {
                    value: "service-scope",
                    label:
                      "Changes to limits on amount, duration, and scope of service",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "service-scope-desc",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: { className: "h-[76px]" },
                      },
                    ],
                  },
                  {
                    value: "prov-qual",
                    label: "Changes to provider qualifications",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "prov-qual-desc",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: { className: "h-[76px]" },
                      },
                    ],
                  },
                  {
                    value: "other",
                    label: "Other changes",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "other-change-desc",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        props: { className: "h-[76px]" },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "TextDisplay",
              name: "d3-desc-d",
              text: [
                {
                  type: "bold",
                  text: "Remote/telehealth service delivery within existing 1915(i) benefit(s)",
                },
              ],
            },
            {
              rhf: "Select",
              name: "allow-telehealth-1915-services",
              label:
                "Will the state allow remote/telehealth service delivery for Section 1915(i) services?",
              labelClassName: "font-bold text-black",
              props: {
                className: "w-32",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "WrappedGroup",
              name: "d3-assurance-wrapper",
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    expectedValue: "yes",
                    name: "ers_d-options-elected_allow-telehealth-1915-services",
                  },
                ],
                effect: { type: "show" },
              },
              props: { wrapperClassName: childStyle + wrappedGroupSpacing },
              fields: [
                {
                  rhf: "Checkbox",
                  name: "d3-assurance-1",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "assured",
                        label:
                          "The state will allow remote/telehealth service delivery for certain Section 1915(i) services.",
                        slots: [
                          {
                            rhf: "Textarea",
                            name: "assurance-1-desc",
                            label: "Describe Services",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "d3-assurance-2",
                  label: "Delivering the service remotely/via telehealth",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "assured",
                        label:
                          "The remote service will be delivered in a way that respects privacy of the individual, especially in instances of toileting, dressing, etc.",
                        slots: [
                          {
                            rhf: "Textarea",
                            name: "assurance-2-desc",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "d3-assurance-3",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "assured",
                        label:
                          "The telehealth service delivery will facilitate community integration.",
                        slots: [
                          {
                            rhf: "Textarea",
                            name: "assurance-3-desc",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "d3-assurance-4",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "assured",
                        label:
                          "The telehealth will ensure the successful delivery of services for individuals who need hands-on assistance or physical assistance, including whether the service can be provided without someone who is physically present or is separated from the individual.",
                        slots: [
                          {
                            rhf: "Textarea",
                            name: "assurance-4-desc",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "d3-assurance-5",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "assured",
                        label:
                          "The state will support individuals who need assistance with using the technology required for telehealth delivery of the service.",
                        slots: [
                          {
                            rhf: "Textarea",
                            name: "assurance-5-desc",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "d3-assurance-6",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "assured",
                        label:
                          "The telehealth will ensure the health and safety of an individual.",
                        slots: [
                          {
                            rhf: "Textarea",
                            name: "assurance-2-desc",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: { className: "h-[76px]" },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            {
              rhf: "Textarea",
              name: "changes-made-to-1915-elig-proc",
              label:
                "Changes made to the 1915(i) eligibility evaluation process",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: { className: "h-[76px]" },
            },
            {
              rhf: "Textarea",
              name: "changes-made-to-1915-assessment-progress",
              label:
                "Changes made to the 1915(i) assessment of needs and/or person-centered service plan progress",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: { className: "h-[76px]" },
            },
          ],
        },
        {
          description:
            "4. Benefits—attestation of compliance with existing requirements for new and adjusted benefits",
          dependency: {
            conditions: [
              {
                expectedValue: "4-compliance_reqs",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d4-desc",
              text: "The agency assures that newly added benefits or adjustments to benefits comply with all applicable statutory requirements, including the statewideness requirements found at 1902(a)(1), comparability requirements found at 1902(a)(10)(B), and free choice of provider requirements found at 1902(a)(23), except in cases where the statutory requirements are waived, such as 1915(i) and 1915(j).",
            },
          ],
        },
        {
          description:
            "5. Alternative Benefit Plan (ABP)—applicability of options 1 and/or 2 to approved ABPs",
          dependency: {
            conditions: [
              {
                expectedValue: "5-abp_applicable_opts",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d5-desc",
              text: "The agency adheres to all ABP provisions in 42 C.F.R. 440(C).",
            },
            {
              rhf: "Checkbox",
              name: "assure-adj-ben-optional",
              props: {
                options: [
                  {
                    value: "assured",
                    label:
                      "The agency assures that these newly added and/or adjusted benefits will be made available to individuals receiving services under ABPs. (optional)",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "abp-provisions-applicable-subjects",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "not-recieve",
                    label:
                      "Individuals receiving services under ABPs will not receive these newly added and/or adjusted benefits.",
                  },
                  {
                    value: "certain-subset",
                    label:
                      "Individuals receiving services under ABPs will receive only a certain subset of newly added and/or adjusted benefits.",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "d5-certain-subset-desc",
                        labelClassName: "font-bold, text-black",
                        label: "Describe",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "not-applicable",
                    label:
                      "Not applicable: The state does not currently have an approved ABP.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "d-options-elected-telehealth",
      subsection: true,
      dependency: {
        conditions: [
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "6-telehealth",
          },
        ],
        effect: { type: "show" },
      },
      title: "D - Benefits options elected - telehealth",
      form: [
        {
          description:
            "6. Telehealth - extend coverage of services provided via telehealth",
          dependency: {
            conditions: [
              {
                expectedValue: "6-telehealth",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d6-desc",
              text: "This may not be needed if there is nothing in the approved state plan prohibiting coverage of services provided via telehealth.",
            },
            {
              rhf: "Textarea",
              rules: { required: "* Required" },
              name: "how-reduce-cs-deductibles",
              label:
                "How does the agency reduce cost sharing, including deductibles, copayments, coinsurance, and other similar charges?",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "d-options-elected-drug-benefit",
      subsection: true,
      dependency: {
        looseConditions: true,
        conditions: [
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "7-pharm_adj_supplies",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "8-pharm_mod_auth",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "9-pharm_add_payment",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "10-pharm_establish",
          },
          {
            type: "expectedValue",
            name: "ers_d-benefits_options-elected",
            expectedValue: "11-pharm_waive_sig",
          },
        ],
        effect: { type: "show" },
      },
      title: "D - Benefits options elected - drug benefit",
      form: [
        {
          description: "7. Pharmacy - adjust days’ supply or quantity limits",
          dependency: {
            conditions: [
              {
                expectedValue: "7-pharm_adj_supplies",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Textarea",
              name: "adj-day-supply-desc",
              label:
                "Adjustments made to the day supply or quantity limit for covered outpatient drugs",
              labelClassName: "font-bold text-black",
              descriptionAbove: true,
              rules: { required: "* Required" },
              description:
                "This modification should only be made if the current state plan pages have limits on the amount of medication dispensed.",
              props: { className: "h-[76px]" },
            },
          ],
        },
        {
          description: "8. Pharmacy - modify prior authorizations",
          dependency: {
            conditions: [
              {
                expectedValue: "8-pharm_mod_auth",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d8-desc",
              text: "Prior authorization for medications is modified to allow for flexibility by automatic approval or renewal without clinical review or by time/quantity extensions.",
            },
          ],
        },
        {
          description:
            "9. Pharmacy - add supplement payment to professional dispensing fee",
          dependency: {
            conditions: [
              {
                expectedValue: "9-pharm_add_payment",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Textarea",
              name: "adj-prof-dispensing-fee",
              rules: { required: "* Required" },
              label: "Payment adjustments made to professional dispensing fee",
              labelClassName: "font-bold text-black",
              descriptionAbove: true,
              description:
                "Agencies must supply documentation to justify the additional fees.",
              props: { className: "h-[76px]" },
            },
          ],
        },
        {
          description:
            "10. Pharmacy - establish preferred drug list (PDL) exceptions",
          dependency: {
            conditions: [
              {
                expectedValue: "10-pharm_establish",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d10-desc",
              text: "The agency makes exceptions to its published PDL if drug shortages occur. This includes options for covering a brand name drug product that is a multi-source drug if a generic drug option is not available.",
            },
          ],
        },
        {
          description: "11. Pharmacy - waive signature requirement(s)",
          dependency: {
            conditions: [
              {
                expectedValue: "11-pharm_waive_sig",
                type: "expectedValue",
                name: "ers_d-benefits_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "d11-desc",
              text: "The agency waives requirement(s) to obtain signatures from beneficiaries or their representatives when receiving a prescription to minimize physical contact.",
            },
          ],
        },
      ],
    },
    {
      sectionId: "e-payments",
      sectionWrapperClassname: "bg-gray-100",
      title: "E - Payments",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "standard-funding-answered",
              props: {
                options: [
                  {
                    value: "assured",
                    label:
                      "The standard funding questions were answered and submitted with this SPA.",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "options-elected",
              label: "Options elected",
              dependency: {
                looseConditions: true,
                conditions: [
                  {
                    type: "expectedValue",
                    name: "ers_d-benefits_options-elected",
                    expectedValue: "1-benefits_add_opt_1905",
                  },
                  {
                    type: "expectedValue",
                    name: "ers_d-benefits_options-elected",
                    expectedValue: "2-benefits_adj_1905_1915",
                  },
                ],
                effect: {
                  type: "setValue",
                  checkUnique: true,
                  fieldName: "ers_e-payments_options-elected",
                  newValue: ["1-establish_payment"],
                },
              },
              labelClassName: "font-bold text-black",
              props: {
                options: [
                  {
                    value: "1-establish_payment",
                    styledLabel: [
                      "1. Establishing payment methodology for newly covered optional benefits described in section D",
                      {
                        type: "br",
                        classname: "italic",
                        text: "Required if D1 and/or D2 are selected",
                      },
                    ],
                  },
                  {
                    value: "2-increase_curr_rates",
                    label: "2. Increasing current state plan payment rates",
                  },
                  {
                    value: "3-pay_telehelath",
                    label: "3. Payment for services delivered via telehealth",
                  },
                  {
                    value: "4-interim_pay",
                    label: "4. Interim payment to providers",
                  },
                  {
                    value: "5-bed_hold_nf",
                    label:
                      "5. Changes to bed hold policies for nursing facilities (NFs)",
                  },
                  {
                    value: "6-bed_hols_icf_iid",
                    label:
                      "6. Changes to bed hold policies for intermediate care facilities for individuals with intellectual disabilities (ICF/IIDs)",
                  },
                  {
                    value: "7-bed_hold_prtf",
                    label:
                      "7. Changes to bed hold policies for hospitals/psychiatric hospitals, including psychiatric residential treatment facilities (PRTF)",
                  },
                  {
                    value: "8-other",
                    label: "8. Other payment changes",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "e-options-elected",
      subsection: true,
      dependency: {
        conditions: [
          { type: "valueExists", name: "ers_e-payments_options-elected" },
        ],
        effect: { type: "show" },
      },
      title: "E - Payments options elected",
      form: [
        {
          description:
            "1. Establish a payment methodology for newly covered optional benefits described in section D",
          dependency: {
            conditions: [
              {
                expectedValue: "1-establish_payment",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "e1-desc",
              text: [
                {
                  type: "bold",
                  text: "Methodology used for payment of newly added benefits described in sections D1 and/or D2",
                },
              ],
            },
            {
              rhf: "FieldArray",
              name: "e1-methodology-arr",
              formItemClassName: childStyle,
              props: {
                appendText: "Add methodology",
                appendVariant: "default",
                divider: true,
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
              },
              fields: [
                {
                  rhf: "Input",
                  name: "e1-benefit-name",
                  label: "Benefit name",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  name: "e1-effective-date",
                  rhf: "DatePicker",
                  label: "Effective date",
                  labelClassName: "font-bold text-black",
                  props: { className: "w-60" },
                  rules: {
                    required: "* Required",
                  },
                },
                {
                  name: "e1-end-date",
                  label: "End date",
                  rhf: "Radio",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "end-of-emergency",
                        label: "End of public health emergency",
                      },
                      {
                        value: "other-date",
                        label: "Other date",
                        slots: [
                          {
                            name: "e1-effective-end-date",
                            rhf: "DatePicker",
                            label: "End date",
                            labelClassName: "font-bold text-black",
                            props: { className: "w-60" },
                            rules: {
                              required: "* Required",
                            },
                          },
                        ],
                      },
                      {
                        value: "other_event",
                        label: "Other event or circumstance",
                        slots: [
                          {
                            name: "e1-describe-event",
                            label: "Describe",
                            rhf: "Textarea",
                            labelClassName: "font-bold text-black",
                            props: {
                              className: "h-[76px]",
                            },
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
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
                  rhf: "Select",
                  name: "methodology-opts",
                  label: "Methodology",
                  labelClassName: "font-bold text-black",
                  props: {
                    className: "w-72",
                    options: e1DropdownOptions,
                  },
                },
                // need way to compare against current field array for deps
                // {
                //   rhf: "Textarea",
                //   formItemClassName: childStyle,
                //   name: "method-desc",
                //   label: "Describe, including link",
                //   dependency: {
                //     conditions: [{expectedValue: "", name: "", type}]
                //   },
                //   labelClassName: "font-bold text-black",rules: {
                //     required: "* Required",
                //     pattern: {
                //       value: noLeadingTrailingWhitespace,
                //       message:
                //         "Must not have leading or trailing whitespace.",
                //     },
                //   },
                // },
                // {
                //   rhf: "Textarea",
                //   formItemClassName: childStyle,
                //   name: "method-desc",
                //   label: "Describe",
                //   labelClassName: "font-bold text-black",rules: {
                //     required: "* Required",
                //     pattern: {
                //       value: noLeadingTrailingWhitespace,
                //       message:
                //         "Must not have leading or trailing whitespace.",
                //     },
                //   },
                // },
                {
                  rhf: "Textarea",
                  formItemClassName: childStyle,
                  name: "method-desc",
                  label: "Describe (optional)",
                  labelClassName: "font-bold text-black",
                },
              ],
            },
          ],
        },
        {
          description: "2. Increase current state plan payment rates",
          dependency: {
            conditions: [
              {
                expectedValue: "2-increase_curr_rates",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "e2-desc-a",
              text: [{ text: "Increased payment rates", type: "bold" }],
            },
            {
              rhf: "FieldArray",
              name: "e2-payment-rate-arr",
              formItemClassName: childStyle,
              props: {
                appendText: "Add methodology",
                appendVariant: "default",
                divider: true,
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
              },
              fields: [
                {
                  rhf: "Input",
                  name: "e2-benefit-name",
                  label: "Benefit name",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  name: "e2-effective-date",
                  rhf: "DatePicker",
                  label: "Effective date",
                  labelClassName: "font-bold text-black",
                  props: { className: "w-60" },
                  rules: {
                    required: "* Required",
                  },
                },
                {
                  name: "e2-end-date",
                  label: "End date",
                  rhf: "Radio",
                  labelClassName: "font-bold text-black",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        value: "end-of-emergency",
                        label: "End of public health emergency",
                      },
                      {
                        value: "other-date",
                        label: "Other date",
                        slots: [
                          {
                            name: "e2-effective-end-date",
                            rhf: "DatePicker",
                            label: "End date",
                            labelClassName: "font-bold text-black",
                            props: { className: "w-60" },
                            rules: {
                              required: "* Required",
                            },
                          },
                        ],
                      },
                      {
                        value: "other_event",
                        label: "Other event or circumstance",
                        slots: [
                          {
                            name: "e2-describe-event",
                            label: "Describe",
                            rhf: "Textarea",
                            labelClassName: "font-bold text-black",
                            props: {
                              className: "h-[76px]",
                            },
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
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
                  name: "payment-options",
                  label: "Payment options",
                  labelClassName: "font-bold text-black",
                  rules: { required: "* Required" },
                  props: {
                    options: [
                      { value: "target-payment", label: "Target payment" },
                      {
                        value: "supplemental",
                        label: "Supplemental increase or add-on",
                      },
                      {
                        value: "uniform-percentage",
                        label: "Uniform percentage",
                      },
                      {
                        value: "modification-fee-sched",
                        label: "Modification of fee schedules",
                      },
                      { value: "medicare-rate", label: "Medicare rate" },
                      {
                        value: "other",
                        label: "Other",
                        slots: [
                          {
                            name: "e2-other-payment-info",
                            label: "Describe",
                            rhf: "Textarea",
                            labelClassName: "font-bold text-black",
                            props: {
                              className: "h-[76px]",
                            },
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
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
                  name: "e2-method-info",
                  label: "Methodology and additional information (optional)",
                  rhf: "Textarea",
                  labelClassName: "font-bold text-black",
                  props: {
                    className: "h-[76px]",
                  },
                },
              ],
            },
          ],
        },
        {
          description: "3. Payment for services delivered via telehealth",
          dependency: {
            conditions: [
              {
                expectedValue: "3-pay_telehelath",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              name: "e3-effective-date",
              rhf: "DatePicker",
              label: "Effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "e3-end-date",
              label: "End date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "e3-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "e3-describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              name: "payment-telehealth-changes",
              label:
                "For the duration of the emergency, the agency authorizes payment for services delivered via telehealth that:",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "new-opt-ben",
                    label:
                      "Are newly covered optional benefits described in section D not otherwise paid under the Medicaid state plan",
                    slots: [
                      {
                        name: "e3-tele-desc",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  {
                    value: "differ-face-to-face",
                    label:
                      "Differ from payments for the same services when provided face to face",
                    slots: [
                      {
                        name: "e3-face-desc",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  {
                    value: "differ-telehealth",
                    label:
                      "Differ from current state plan provisions governing reimbursement for services delivered via telehealth",
                    slots: [
                      {
                        name: "e3-tele-differ-desc",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  {
                    value: "include-ancillary",
                    label:
                      "Include payment for ancillary costs associated with the delivery of covered services via telehealth, if applicable",
                    slots: [
                      {
                        rhf: "Checkbox",
                        name: "e3-ancillary-cost-opts",
                        rules: { required: "* Required" },
                        props: {
                          options: [
                            {
                              value: "fee-for-service",
                              label:
                                "Ancillary cost associated with the originating site for telehealth is incorporated into fee-for-service rates.",
                            },
                            {
                              value: "separate-reimbursed",
                              label:
                                "Ancillary cost associated with the originating site for telehealth is separately reimbursed as an administrative cost by the agency when a Medicaid service is delivered.",
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "e3-temp-tele-changes",
              label:
                "Additional information about payment for services delivered via telehealth (optional)",
              labelClassName: "font-bold text-black",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description: "4. Interim payment to providers",
          dependency: {
            conditions: [
              {
                expectedValue: "4-interim_pay",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              name: "e4-effective-date",
              rhf: "DatePicker",
              label: "Effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "e4-end-date",
              label: "End date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "e4-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "e4-describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              rhf: "TextDisplay",
              name: "e4-desc",
              text: "The agency elects to make interim payments to providers. If the agency elects to make interim payments via managed care, use the managed care State Directed Payments Template.",
            },
            {
              rhf: "Textarea",
              name: "e4-temp-nf-changes",
              label:
                "Describe the interim payment methodology used to determine the amounts, the providers to whom it will be available, and how and when the agency will reconcile the interim payments with billed claims in their fee-for-service system or to the provider's actual costs.",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description:
            "5. Changes to bed hold policies for nursing facilities (NFs)",
          dependency: {
            conditions: [
              {
                expectedValue: "5-bed_hold_nf",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              name: "e5-effective-date",
              rhf: "DatePicker",
              label: "Effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "e5-end-date",
              label: "End date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "e5-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "e5-describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              rhf: "Textarea",
              name: "e5-temp-nf-changes",
              label: "Temporary changes to bed hold policies for NFs",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description: "6. ",
          dependency: {
            conditions: [
              {
                expectedValue: "6-bed_hols_icf_iid",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              name: "e6-effective-date",
              rhf: "DatePicker",
              label: "Effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "e6-end-date",
              label: "End date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "e6-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "e6-describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              rhf: "Textarea",
              name: "e6-temp-icf-iid-changes",
              label: "Temporary changes to bed hold policies for ICF/IIDs",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description:
            "7. Changes to bed hold policies for hospitals/psychiatric hospitals, including psychiatric residential treatment facilities (PRTF)",
          dependency: {
            conditions: [
              {
                expectedValue: "7-bed_hold_prtf",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              name: "e7-effective-date",
              rhf: "DatePicker",
              label: "Effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "e7-end-date",
              label: "End date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "e7-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "e7-describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              rhf: "Textarea",
              name: "e7-temp-bed-hold-policy-changes",
              label:
                "Temporary changes to hospital/psychiatric hospital (including PRTF) bed hold policies",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
        {
          description: "8. Other payment changes",
          dependency: {
            conditions: [
              {
                expectedValue: "8-other",
                type: "expectedValue",
                name: "ers_e-payments_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              name: "e8-effective-date",
              rhf: "DatePicker",
              label: "Effective date",
              labelClassName: "font-bold text-black",
              props: { className: "w-60" },
              rules: {
                required: "* Required",
              },
            },
            {
              name: "e8-end-date",
              label: "End date",
              rhf: "Radio",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "end-of-emergency",
                    label: "End of public health emergency",
                  },
                  {
                    value: "other-date",
                    label: "Other date",
                    slots: [
                      {
                        name: "e8-effective-end-date",
                        rhf: "DatePicker",
                        label: "End date",
                        labelClassName: "font-bold text-black",
                        props: { className: "w-60" },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    value: "other_event",
                    label: "Other event or circumstance",
                    slots: [
                      {
                        name: "e8-describe-event",
                        label: "Describe",
                        rhf: "Textarea",
                        labelClassName: "font-bold text-black",
                        props: {
                          className: "h-[76px]",
                        },
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
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
              rhf: "Textarea",
              name: "e8-temp-payment-changes",
              label: "Temporary payment changes",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "f-post-el-treatment-income",
      sectionWrapperClassname: "bg-gray-100",
      title: "F  -  Post-eligibility treatment of income",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "options-elected",
              label: "Options elected",
              labelClassName: "font-bold text-black",
              props: {
                options: [
                  {
                    value: "1-mod_basic",
                    label: "1. Modify the basic personal needs allowance.",
                  },
                  {
                    value: "2-elect_variance",
                    label:
                      "2. Elect a variance to the basic personal needs allowance.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "f-options-elected",
      subsection: true,
      dependency: {
        conditions: [
          {
            type: "valueExists",
            name: "ers_f-post-el-treatment-income_options-elected",
          },
        ],
        effect: { type: "show" },
      },
      title: "F  -  Post-eligibility treatment of income options elected",
      form: [
        {
          description: "1. Modify the basic personal needs allowance.",
          dependency: {
            conditions: [
              {
                expectedValue: "1-mod_basic",
                type: "expectedValue",
                name: "ers_f-post-el-treatment-income_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Radio",
              name: "basic-allowance-mod",
              label: "The basic personal needs allowance is modified for:",
              labelClassName: "text-black font-bold",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "all-inst-ind",
                    label: "All institutionalized individuals",
                  },
                  {
                    value: "ind-in-certain-inst",
                    label: "Individuals in certain institution(s)",
                    slots: [
                      {
                        rhf: "Checkbox",
                        name: "certain-inst-modified",
                        rules: { required: "* Required" },
                        props: {
                          options: [
                            {
                              value: "inter-care-fac",
                              label:
                                "Intermediate care facilities for individuals with intellectual disabilities",
                            },
                            {
                              value: "nurse-facs",
                              label: "Nursing facilities",
                            },
                            { value: "hospitals", label: "Hospitals" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Radio",
              name: "basic-personal-allowance",
              label: "The basic personal needs allowance is equal to:",
              labelClassName: "text-black font-bold",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "ind-total-inc",
                    label: "The individual’s total income",
                  },
                  {
                    value: "300-ssi-rate",
                    label: "300% of the SSI federal benefit rate",
                  },
                  {
                    value: "other",
                    label: "Other reasonable amount",
                    slots: [
                      {
                        rhf: "Input",
                        name: "allowance-amount",
                        label: "Amount",
                        labelClassName: "text-black font-bold",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^[0-9]\d*$/,
                            message: "Must be a positive integer value",
                          },
                        },
                        props: {
                          icon: "$",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          description:
            "2. Elect a variance to the basic personal needs allowance.",
          dependency: {
            conditions: [
              {
                expectedValue: "2-elect_variance",
                type: "expectedValue",
                name: "ers_f-post-el-treatment-income_options-elected",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "TextDisplay",
              name: "f2-desc",
              text: "The agency elects a new temporary variance to the personal needs allowance and protects amounts exceeding the basic personal needs allowance for individuals who have certain greater personal needs.",
            },
            {
              rhf: "Textarea",
              name: "personal-needs",
              label: "Greater personal needs",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
      ],
    },
    {
      sectionId: "g-other-policies",
      title:
        "G  -  Other policies and procedures differing from approved Medicaid state plan",
      form: [
        {
          slots: [
            {
              rhf: "Textarea",
              name: "pol-and-procedures",
              label:
                "Other policies and procedures differing from approved Medicaid state plan",
              labelClassName: "text-black font-bold",
              descriptionAbove: true,
              description:
                "This includes legal reference for provision being temporarily amended.",
            },
          ],
        },
      ],
    },
    {
      sectionId: "addtnl-info",
      title: "Additional information",
      form: [
        {
          slots: [
            {
              rhf: "Textarea",
              name: "adttnl-desc",
              label: "Additional information (optional)",
              labelClassName: "text-black font-bold",
              props: {
                className: "h-[76px]",
              },
            },
          ],
        },
      ],
    },
  ],
};
