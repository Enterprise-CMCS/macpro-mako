/**
 * The validator is intended to be a replica of RHF validation.
 * To be used in backend api handlers to validate incoming/outgoing form data against document when...
 * - creating/saving form data
 * - retrieving form data
 */
import * as T from "shared-types";
import { RegisterOptions } from "react-hook-form";
import { FormSchema } from "shared-types";

import {
  isNullOrUndefined,
  isUndefined,
  isRegex,
  getValueAndMessage,
  isString,
  ERROR,
  // INPUT_VALIDATION_RULES,
  // isFunction,
  // MaxType,
  // MinType,
} from "./is";

export const validateInput = (inputValue: any, rules?: RegisterOptions) => {
  const isEmpty =
    isUndefined(inputValue) ||
    inputValue === "" ||
    (Array.isArray(inputValue) && !inputValue.length);

  if (isEmpty && rules?.required) {
    return isString(rules.required) ? rules.required : "*Required";
  }

  if (
    !isEmpty &&
    (!isNullOrUndefined(rules?.min) || !isNullOrUndefined(rules?.max))
  ) {
    let exceedMax;
    let exceedMin;
    const maxOutput = getValueAndMessage(rules?.max);
    const minOutput = getValueAndMessage(rules?.min);

    if (!isNullOrUndefined(inputValue) && !isNaN(inputValue as number)) {
      const valueNumber = inputValue ? +inputValue : inputValue;
      if (!isNullOrUndefined(maxOutput.value)) {
        exceedMax = valueNumber > maxOutput.value;
      }
      if (!isNullOrUndefined(minOutput.value)) {
        exceedMin = valueNumber < minOutput.value;
      }
    } else {
      const valueDate = new Date(inputValue as string);
      // const convertTimeToDate = (time: unknown) =>
      //   new Date(new Date().toDateString() + " " + time);
      // // const isTime = ref.type == "time";
      // // const isWeek = ref.type == "week";

      if (isString(maxOutput.value) && inputValue) {
        exceedMax = valueDate > new Date(maxOutput.value);
      }

      if (isString(minOutput.value) && inputValue) {
        exceedMin = valueDate < new Date(minOutput.value);
      }
    }

    if (exceedMax) return maxOutput.message;
    if (exceedMin) return minOutput.message;
  }

  if (
    (rules?.maxLength || rules?.minLength) &&
    !isEmpty &&
    isString(inputValue)
  ) {
    const maxLengthOutput = getValueAndMessage(rules?.maxLength);
    const minLengthOutput = getValueAndMessage(rules?.minLength);
    const exceedMax =
      !isNullOrUndefined(maxLengthOutput.value) &&
      inputValue.length > +maxLengthOutput.value;
    const exceedMin =
      !isNullOrUndefined(minLengthOutput.value) &&
      inputValue.length < +minLengthOutput.value;

    if (exceedMax) return maxLengthOutput.message;
    if (exceedMin) return minLengthOutput.message;
  }

  if (rules?.pattern && !isEmpty && isString(inputValue)) {
    const { value: patternValue, message } = getValueAndMessage(rules?.pattern);

    if (isRegex(patternValue) && !inputValue.match(patternValue)) {
      return message;
    }
  }
  // TODO: Add validate condition
  // if (rules?.validate) {
  //   if (isFunction(rules?.validate)) {
  //     const result = await rules?.validate(inputValue, formValues);
  //     const validateError = getValidateError(result, inputRef);

  //     if (validateError) {
  //       error[name] = {
  //         ...validateError,
  //         ...appendErrorsCurry(
  //           INPUT_VALIDATION_RULES.validate,
  //           validateError.message
  //         ),
  //       };
  //       if (!validateAllFieldCriteria) {
  //         setCustomValidity(validateError.message);
  //         return error;
  //       }
  //     }
  //   } else if (isObject(validate)) {
  //     let validationResult = {} as FieldError;

  //     for (const key in validate) {
  //       if (!isEmptyObject(validationResult) && !validateAllFieldCriteria) {
  //         break;
  //       }

  //       const validateError = getValidateError(
  //         await validate[key](inputValue, formValues),
  //         inputRef,
  //         key
  //       );

  //       if (validateError) {
  //         validationResult = {
  //           ...validateError,
  //           ...appendErrorsCurry(key, validateError.message),
  //         };

  //         setCustomValidity(validateError.message);

  //         if (validateAllFieldCriteria) {
  //           error[name] = validationResult;
  //         }
  //       }
  //     }

  //     if (!isEmptyObject(validationResult)) {
  //       error[name] = {
  //         ref: inputRef,
  //         ...validationResult,
  //       };
  //       if (!validateAllFieldCriteria) {
  //         return error;
  //       }
  //     }
  //   }
  // }

  // If all checks pass, the input value is valid
  return "";
};

export const validateOption = (optionValue: string, options: any[]) => {
  return options.find((OPT: any) => OPT.value === optionValue);
};

// return true: run validation - false: skip validation
export const dependencyCheck = (dep: T.DependencyRule, data: any) => {
  const conditionMatched = dep.conditions.every((DC) => {
    if (DC.type === "valueNotExist") return !data[DC.name];
    if (DC.type === "expectedValue") {
      return data[DC.name] === DC.expectedValue;
    }

    return !!data[DC.name];
  });

  if (dep.effect.type === "show") return conditionMatched;
  if (dep.effect.type === "hide") return !conditionMatched;
};

export const formGroupValidator =
  (data: any) => (ACC: ERROR, FORM: T.FormGroup) => {
    if (FORM.dependency) {
      const depMatch = dependencyCheck(FORM.dependency, data);
      if (!depMatch) return ACC;
    }
    FORM.slots.reduce(slotValidator(data), ACC);
    return ACC;
  };

export const slotValidator =
  (data: any) =>
  (ACC: ERROR, SLOT: T.RHFSlotProps): ERROR => {
    const optionValidator = (OPT: T.RHFOption) => {
      if (OPT.form) OPT.form.reduce(formGroupValidator(data), ACC);
      if (OPT.slots) {
        OPT.slots.reduce(slotValidator(data), ACC);
      }
      return ACC;
    };

    const fieldValidator = (FLD: any) => (SLOT1: T.RHFSlotProps) => {
      if (SLOT1.rhf === "FieldArray") {
        FLD[SLOT1.name].forEach((DAT: any) => {
          SLOT1.fields?.forEach(fieldValidator(DAT));
        });
      } else if (SLOT1.rhf === "FieldGroup") {
        FLD[SLOT1.name].forEach((DAT: any) => {
          SLOT1.fields?.forEach(fieldValidator(DAT));
        });
      } else {
        slotValidator(FLD)(ACC, SLOT1);
      }
    };

    if (SLOT.dependency) {
      const depMatch = dependencyCheck(SLOT.dependency, data);
      if (!depMatch) return ACC;
    }

    if (SLOT.rhf === "Input") {
      ACC[SLOT.name] = validateInput(data[SLOT.name], SLOT.rules);
    }
    if (SLOT.rhf === "Textarea") {
      ACC[SLOT.name] = validateInput(data[SLOT.name], SLOT.rules);
    }

    if (SLOT.rhf === "Switch") {
      ACC[SLOT.name] = validateInput(data[SLOT.name], SLOT.rules);
    }

    if (SLOT.rhf === "Radio") {
      const validOption = SLOT.props?.options.find(
        (OPT) => OPT.value === data[SLOT.name]
      );
      if (!validOption) {
        ACC[SLOT.name] = `invalid option - '${data[SLOT.name]}'`;
      } else {
        optionValidator(validOption);
      }
    }

    if (SLOT.rhf === "Select") {
      const validOption = SLOT.props?.options.find(
        (OPT) => OPT.value === data[SLOT.name]
      );
      if (!validOption) {
        ACC[SLOT.name] = `invalid option - '${data[SLOT.name]}'`;
      } else {
        optionValidator(validOption);
      }
    }

    if (SLOT.rhf === "Checkbox") {
      if (data[SLOT.name]?.length) {
        const validList = data[SLOT.name].every((VAL: any) => {
          return SLOT.props?.options.some((OPT) => OPT.value === VAL);
        });
        if (!validList) {
          ACC[SLOT.name] = `invalid option - '${data[SLOT.name]}'`;
        }

        const selectedOptions = SLOT.props?.options.filter((OPT) =>
          data[SLOT.name].includes(OPT.value)
        );
        selectedOptions?.forEach(optionValidator);
      }
    }

    if (SLOT.rhf === "FieldArray") {
      data[SLOT.name].forEach((DAT: any) => {
        SLOT.fields?.forEach(fieldValidator(DAT));
      });
    }
    if (SLOT.rhf === "FieldGroup") {
      data[SLOT.name].forEach((DAT: any) => {
        SLOT.fields?.forEach(fieldValidator(DAT));
      });
    }

    return ACC;
  };

export const documentValidator = (document: FormSchema) => (data: any) => {
  return document.sections.reduce((ACC, SEC) => {
    if (SEC.dependency) {
      const depMatch = dependencyCheck(SEC.dependency, data);
      if (!depMatch) return ACC;
    }
    SEC.form.reduce(formGroupValidator(data), ACC);
    return ACC;
  }, {} as ERROR);
};
