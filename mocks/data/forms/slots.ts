import { RHFSlotProps } from "shared-types";

const upload: RHFSlotProps = {
  rhf: "Upload",
  name: "test-upload",
  label: "State plan amendment attachment",
  labelClassName: "font-bold",
  description: "Only required if not using the payment methodology in the approved state plan",
  descriptionAbove: true,
  props: { maxFiles: 3 },
};
const checkbox: RHFSlotProps = {
  rhf: "Checkbox",
  name: "test_checkbox",
  rules: { required: "* Required" },
  props: {
    options: [
      {
        label: "test_label",
        value: "test-value",
      },
      {
        label: "test_label2",
        value: "test-value2",
      },
    ],
  },
};
const radio: RHFSlotProps = {
  rhf: "Radio",
  name: "test_radio",
  rules: {
    required: "* Required",
  },
  props: {
    options: [
      {
        label: "Households with income at or below the standard",
        value: "1",
      },
      {
        label: "Households with income above the standard",
        value: "2",
      },
    ],
  },
};
const textForm: RHFSlotProps = {
  name: "firstName",
  label: "First Name",
  rhf: "Textarea",
  rules: { required: "First Name is required" },
};
const inputBox: RHFSlotProps = {
  rhf: "Input",
  name: "testNameInput",
  label: "Test input value",

  props: { placeholder: "enter name" },
};
const selectField: RHFSlotProps = {
  rhf: "Select",
  name: "test_select",
  label: "test select",
  labelClassName: "font-bold",
  rules: { required: "* Required" },
  props: {
    className: "w-[150px]",
    options: [
      { label: "Yes", value: "yes" },
      {
        label: "No",
        value: "no",
      },
    ],
  },
};
const switchField: RHFSlotProps = {
  name: "notifications",
  label: "Enable Notifications",
  rhf: "Switch",
};
const fieldArray: RHFSlotProps = {
  rhf: "FieldArray",
  name: "field-array",
  label: `field_label`,
  labelClassName: "font-bold",
  props: {
    appendText: "Add benefit or service",
    removeText: "Remove",
  },
  fields: [
    {
      rhf: "WrappedGroup",
      name: "wrapped_fields",

      fields: [textForm, inputBox],
    },
  ],
};
const fieldArrayParent: RHFSlotProps = {
  rhf: "FieldArray",
  name: "field-array-parent",
  label: `field_label`,
  labelClassName: "font-bold",
  props: {
    appendText: "Add benefit or service",
    removeText: "Remove",
  },
  fields: [
    {
      rhf: "FieldArray",
      name: "wrapped_fields",
      fields: [fieldArray],
    },
  ],
};
export const slots = {
  checkbox,
  fieldArray,
  fieldArrayParent,
  inputBox,
  radio,
  selectField,
  switchField,
  textForm,
  upload,
};
