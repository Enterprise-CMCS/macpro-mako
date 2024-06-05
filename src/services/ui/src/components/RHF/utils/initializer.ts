import * as T from "shared-types";

type GL = Record<string, unknown>;

export const formGroupInitializer =
  (parentId?: string) => (ACC: GL, FORM: T.FormGroup) => {
    FORM.slots.reduce(slotInitializer(parentId), ACC);
    return ACC;
  };

export const slotInitializer =
  (parentId?: string) =>
  (ACC: GL, SLOT: T.RHFSlotProps): GL => {
    const adjustedName = `${parentId ?? ""}${SLOT.name}`;

    const optionReducer = (OPT: T.RHFOption) => {
      if (OPT.form) OPT.form.reduce(formGroupInitializer(parentId), ACC);
      if (OPT.slots) OPT.slots.reduce(slotInitializer(parentId), ACC);
      return ACC;
    };

    const fieldInitializer = (ACC1: GL, SLOTC: T.RHFSlotProps): GL => {
      if (SLOTC.rhf === "FieldArray" || SLOTC.rhf === "FieldGroup") {
        return {
          ...ACC1,
          [SLOTC.name]: [SLOTC.fields?.reduce(fieldInitializer, {})],
        };
      }

      return { ...ACC1, ...slotInitializer()(ACC1, SLOTC) };
    };

    switch (SLOT.rhf) {
      case "Switch":
        ACC[adjustedName] = false;
        break;
      case "Checkbox":
        SLOT.props?.options.forEach(optionReducer);
        ACC[adjustedName] = [];
        break;
      case "FieldArray":
      case "FieldGroup":
        ACC[adjustedName] = [SLOT.fields?.reduce(fieldInitializer, {})];
        break;
      case "Upload":
        ACC[adjustedName] = [];
        break;
      case "Input":
      case "Select":
      case "Radio":
      case "Textarea":
      default:
        ACC[adjustedName] = "";
        break;
    }

    return ACC;
  };

export const documentInitializer = (document: T.FormSchema) => {
  return document.sections.reduce((ACC, SEC) => {
    SEC.form.reduce(
      formGroupInitializer(`${document.formId}_${SEC.sectionId}_`),
      ACC,
    );
    return ACC;
  }, {});
};
