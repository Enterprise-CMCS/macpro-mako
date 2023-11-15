import * as T from "@/components/RHF/types";

type GL = Record<string, any>;

export const formGroupInitializer = (ACC: GL, FORM: T.FormGroup) => {
  FORM.slots.reduce(slotInitializer, ACC);
  return ACC;
};

export const slotInitializer = (ACC: GL, SLOT: T.RHFSlotProps): GL => {
  const optionReducer = (OPT: T.RHFOption) => {
    if (OPT.form) OPT.form.reduce(formGroupInitializer, ACC);
    if (OPT.slots) OPT.slots.reduce(slotInitializer, ACC);
    return ACC;
  };

  const fieldInitializer = (ACC1: GL, SLOT: T.RHFSlotProps): GL => {
    if (SLOT.rhf === "FieldArray") {
      return {
        ...ACC1,
        [SLOT.name]: [SLOT.fields?.reduce(fieldInitializer, {})],
      };
    }
    if (SLOT.rhf === "FieldGroup") {
      return {
        ...ACC1,
        [SLOT.name]: [SLOT.fields?.reduce(fieldInitializer, {})],
      };
    }

    return { ...ACC1, ...slotInitializer(ACC1, SLOT) };
  };

  switch (SLOT.rhf) {
    case "Switch":
      ACC[SLOT.name] = false;
      break;
    case "Radio":
    case "Checkbox":
      SLOT.props?.options.forEach(optionReducer);
      ACC[SLOT.name] = [];
      break;
    case "FieldArray":
    case "FieldGroup":
      ACC[SLOT.name] = [SLOT.fields?.reduce(fieldInitializer, {})];
      break;
    case "Input":
    case "Select":
    case "Textarea":
    default:
      ACC[SLOT.name] = "";
      break;
  }

  return ACC;
};

export const documentInitializer = (document: T.Document) => {
  return document.sections.reduce((ACC, SEC) => {
    SEC.form.reduce(formGroupInitializer, ACC);
    return ACC;
  }, {} as any);
};
