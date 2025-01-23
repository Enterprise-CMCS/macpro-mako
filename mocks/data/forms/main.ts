import { FormSchema } from "shared-types";
import { slots } from "./slots";

export const textForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.textForm],
        },
      ],
    },
    {
      title: "dependency",
      sectionId: "dependencySection",
      dependency: {
        conditions: [{ name: "acceptTerms", type: "valueExists" }],
        effect: { type: "show" },
      },
      form: [
        {
          description: "Set your preferences.",
          slots: [
            {
              name: "notifications",
              label: "Enable Notifications",
              rhf: "Switch",
            },
          ],
        },
      ],
    },
  ],
};
export const uploadForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.upload],
        },
      ],
    },
  ],
};
export const checkboxForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.checkbox],
        },
      ],
    },
  ],
};
export const radioForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.radio],
        },
      ],
    },
  ],
};
export const selectForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.selectField],
        },
      ],
    },
  ],
};
export const switchForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.switchField],
        },
      ],
    },
  ],
};
export const inputForm: FormSchema = {
  header: "Test header",
  formId: "testID",
  sections: [
    {
      title: "testForm",
      sectionId: "testSection",
      form: [
        {
          slots: [slots.inputBox],
        },
      ],
    },
  ],
};

export const mockForms = {
  checkboxForm,
  inputForm,
  radioForm,
  selectForm,
  switchForm,
  textForm,
  uploadForm,
};
