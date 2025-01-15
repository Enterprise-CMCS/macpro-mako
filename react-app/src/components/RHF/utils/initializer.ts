import { RHFOption, RHFSlotProps, FormGroup, FormSchema } from "shared-types/forms";

type GL = Record<string, unknown>;

export const formGroupInitializer = (parentId?: string) => (ACC: GL, FORM: FormGroup) => {
  FORM.slots.reduce(slotInitializer(parentId), ACC);
  return ACC;
};

export const slotInitializer =
  (parentId?: string) =>
  (ACC: GL, SLOT: RHFSlotProps): GL => {
    const adjustedName = `${parentId ?? ""}${SLOT.name}`;

    const optionReducer = (OPT: RHFOption) => {
      if (OPT.form) OPT.form.reduce(formGroupInitializer(parentId), ACC);
      if (OPT.slots) OPT.slots.reduce(slotInitializer(parentId), ACC);
      return ACC;
    };

    const fieldInitializer = (ACC1: GL, SLOTC: RHFSlotProps): GL => {
      if (SLOTC.rhf === "FieldArray") {
        return {
          ...ACC1,
          [SLOTC.name]: [SLOTC.fields?.reduce(fieldInitializer, {})],
        };
      }

      return { ...ACC1, ...slotInitializer()(ACC1, SLOTC) };
    };

    switch (SLOT.rhf) {
      case "TextDisplay":
        break;
      case "Switch":
        ACC[adjustedName] = false;
        break;
      case "Checkbox":
        SLOT.props?.options.forEach(optionReducer);
        ACC[adjustedName] = [];
        break;
      case "Radio":
        SLOT.props?.options.forEach(optionReducer);
        ACC[adjustedName] = "";
        break;
      case "FieldArray":
        ACC[adjustedName] = [SLOT.fields?.reduce(fieldInitializer, {})];
        break;
      case "WrappedGroup":
        ACC = { ...ACC, ...SLOT.fields?.reduce(fieldInitializer, {}) };
        break;
      case "Upload":
        ACC[adjustedName] = [];
        break;
      // If switching from undefined to a Date causes an error from RHF,
      // DatePickerProps in inputs.ts may need to be adjusted:
      case "DatePicker":
        ACC[adjustedName] = undefined;
        break;
      case "Input":
      case "Select":
      case "Multiselect":
      case "Textarea":
      default:
        ACC[adjustedName] = "";
        break;
    }

    return ACC;
  };

export const documentInitializer = (document: FormSchema) => {
  return document.sections.reduce((ACC, SEC) => {
    SEC.form.reduce(formGroupInitializer(`${document.formId}_${SEC.sectionId}_`), ACC);
    return ACC;
  }, {});
};
