import * as T from "@/components/RHF/types";

type GL = Record<string, any>;

export const formGroupReducer = (ACC: GL, FORM: T.FormGroup) => {
  FORM.slots.reduce(slotReducer, ACC);
  return ACC;
};

export const slotReducer = (ACC: GL, SLOT: T.RHFSlotProps): GL => {
  const optionReducer = (OPT: T.RHFOption) => {
    if (OPT.form) OPT.form.reduce(formGroupReducer, ACC);
    if (OPT.slots) OPT.slots.reduce(slotReducer, ACC);
    return ACC;
  };

  const fieldReducer = (ACC1: GL, SLOT: T.RHFSlotProps): GL => {
    if (SLOT.rhf === "FieldArray") {
      return { ...ACC1, [SLOT.name]: [SLOT.fields?.reduce(fieldReducer, {})] };
    }
    if (SLOT.rhf === "FieldGroup") {
      return { ...ACC1, [SLOT.name]: [SLOT.fields?.reduce(fieldReducer, {})] };
    }

    return { ...ACC1, ...slotReducer(ACC1, SLOT) };
  };

  if (SLOT.rhf === "Input") ACC[SLOT.name] = "";
  if (SLOT.rhf === "Textarea") ACC[SLOT.name] = "";
  if (SLOT.rhf === "Switch") ACC[SLOT.name] = false;
  if (SLOT.rhf === "Radio") {
    if (SLOT.props?.options) {
      SLOT.props.options.forEach(optionReducer);
      const [first] = SLOT.props.options;
      ACC[SLOT.name] = first.value;
    }
  }

  if (SLOT.rhf === "Select") {
    if (SLOT.props?.options) {
      SLOT.props.options.forEach(optionReducer);
      const [first] = SLOT.props.options;
      ACC[SLOT.name] = first.value;
    }
  }

  if (SLOT.rhf === "Checkbox") {
    if (SLOT.props?.options) {
      SLOT.props.options.forEach(optionReducer);
      const [first] = SLOT.props.options;
      ACC[SLOT.name] = first.value;
    }
  }

  if (SLOT.rhf === "FieldArray")
    ACC[SLOT.name] = [SLOT.fields?.reduce(fieldReducer, {})];
  if (SLOT.rhf === "FieldGroup")
    ACC[SLOT.name] = [SLOT.fields?.reduce(fieldReducer, {})];

  return ACC;
};

export const documentInitializer = (document: T.Document) => {
  return document.sections.reduce((ACC, SEC) => {
    SEC.form.reduce(formGroupReducer, ACC);
    return ACC;
  }, {} as any);
};
