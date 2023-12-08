import {
  Control,
  FieldArrayPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import type { ReactElement } from "react";
import {
  InputProps,
  SwitchProps,
  TextareaProps,
  SelectProps,
  RadioProps,
  CalendarProps,
} from "shared-types";

export type RHFSlotProps = {
  name: string;
  label?: ReactElement | string;
  labelStyling?: string;
  groupNamePrefix?: string;
  description?: ReactElement | string;
  dependency?: DependencyRule;
  rules?: RegisterOptions;
} & {
  [K in keyof RHFComponentMap]: {
    rhf: K;
    props?: RHFComponentMap[K];
    fields?: K extends "FieldArray"
      ? RHFSlotProps[]
      : K extends "FieldGroup"
      ? RHFSlotProps[]
      : never;
  };
}[keyof RHFComponentMap];

export type RHFOption = {
  label: string;
  value: string;
  form?: FormGroup[];
  slots?: RHFSlotProps[];
};

export type RHFComponentMap = {
  Input: InputProps & {
    label?: ReactElement | string;
    description?: ReactElement | string;
  };
  Textarea: TextareaProps;
  Switch: SwitchProps;
  Select: SelectProps;
  Radio: RadioProps & {
    options: RHFOption[];
  };
  DatePicker: CalendarProps;
  Checkbox: {
    options: RHFOption[];
  };
  FieldArray: unknown;
  FieldGroup: {
    appendText?: string;
    removeText?: string;
  };
};

export type FormGroup = {
  description?: string;
  slots: RHFSlotProps[];
  wrapperStyling?: string;
  dependency?: DependencyRule;
};

export interface Section {
  title: string;
  form: FormGroup[];
  dependency?: DependencyRule;
}

export interface Document {
  header: string;
  sections: Section[];
}

export type FieldArrayProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<T> = FieldArrayPath<T>
> = {
  control: Control<T, unknown>;
  name: TFieldArrayName;
  fields: RHFSlotProps[];
  groupNamePrefix?: string;
};

export type FieldGroupProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<T> = FieldArrayPath<T>
> = {
  control: Control<T, unknown>;
  name: TFieldArrayName;
  fields: RHFSlotProps[];
  appendText?: string;
  removeText?: string;
  groupNamePrefix?: string;
};

type ConditionRules =
  | {
      type: "valueExists" | "valueNotExist";
    }
  | {
      type: "expectedValue";
      expectedValue: unknown;
    };

type Condition = { name: string } & ConditionRules;

type Effects =
  | {
      type: "show" | "hide";
    }
  | {
      type: "setValue";
      newValue: unknown;
    };

export interface DependencyRule {
  conditions: Condition[];
  effect: Effects;
}

export interface DependencyWrapperProps {
  name?: string;
  dependency?: DependencyRule;
}
