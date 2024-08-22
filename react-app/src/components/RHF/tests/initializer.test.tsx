import { describe, test, expect } from "vitest";
import { documentInitializer } from "../utils/initializer";
import { FormSchema } from "shared-types";

const form: FormSchema = {
  formId: "testForm",
  header: "test form",
  sections: [
    {
      sectionId: "sec1",
      title: "sec1",
      form: [
        {
          slots: [
            {
              name: "switch",
              rhf: "Switch",
            },
            {
              name: "input",
              rhf: "Input",
            },
            {
              name: "select",
              rhf: "Select",
            },
            {
              name: "datePicker",
              rhf: "DatePicker",
            },
            {
              name: "textDisplay",
              rhf: "TextDisplay",
            },
            {
              name: "radio",
              rhf: "Radio",
              props: {
                options: [
                  {
                    value: "a",
                    label: "a",
                    slots: [
                      {
                        name: "textarea",
                        rhf: "Textarea",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "checkbox",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    value: "a",
                    label: "a",
                    form: [
                      {
                        slots: [
                          {
                            name: "upload",
                            rhf: "Upload",
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
      ],
    },
    {
      sectionId: "sec2",
      title: "sec2",
      form: [
        {
          slots: [
            {
              name: "fieldArray",
              rhf: "FieldArray",
              fields: [
                {
                  name: "input",
                  rhf: "Input",
                },
              ],
            },
            {
              name: "fieldGroup",
              rhf: "FieldArray",
              fields: [
                {
                  name: "input",
                  rhf: "Input",
                },
                {
                  name: "wrapper",
                  rhf: "WrappedGroup",
                  fields: [
                    {
                      name: "textArea",
                      rhf: "Textarea",
                    },
                    {
                      name: "select",
                      rhf: "Select",
                    },
                  ],
                },
                {
                  name: "fieldArray",
                  rhf: "FieldArray",
                  fields: [
                    {
                      name: "input",
                      rhf: "Input",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const initForm = {
  testForm_sec1_switch: false,
  testForm_sec1_input: "",
  testForm_sec1_select: "",
  testForm_sec1_datePicker: undefined,
  testForm_sec1_textarea: "",
  testForm_sec1_radio: "",
  testForm_sec1_upload: [],
  testForm_sec1_checkbox: [],
  testForm_sec2_fieldArray: [{ input: "" }],
  testForm_sec2_fieldGroup: [
    { input: "", textArea: "", select: "", fieldArray: [{ input: "" }] },
  ],
};

describe("Test Form Initializer", () => {
  test("Generate Initialized Form Data", () => {
    const testForm = documentInitializer(form);
    expect(JSON.stringify(testForm)).toEqual(JSON.stringify(initForm));
  });
});
