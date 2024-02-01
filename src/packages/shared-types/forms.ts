import {
  Control,
  FieldArrayPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import {
  CalendarProps,
  InputProps,
  RadioProps,
  SelectProps,
  SwitchProps,
  TextareaProps,
} from "shared-types";

export interface FormSchema {
  header: string;
  sections: Section[];
}

export type RHFSlotProps = {
  name: string;
  label?: string;
  labelStyling?: string;
  formItemStyling?: string;
  groupNamePrefix?: string;
  removeFormDecoration?: boolean;
  description?: string;
  descriptionAbove?: boolean;
  descriptionStyling?: string;
  dependency?: DependencyRule;
  rules?: RegisterOptions;
} & {
  [K in keyof RHFComponentMap]: {
    rhf: K;
    props?: RHFComponentMap[K];
    text?: K extends "TextDisplay" ? string : never;
    fields?: K extends "FieldArray"
      ? RHFSlotProps[]
      : K extends "FieldGroup"
      ? RHFSlotProps[]
      : K extends "TableGroup"
      ? RHFSlotProps[]
      : never;
  };
}[keyof RHFComponentMap];

export type RHFOption = {
  label: string;
  value: string;
  dependency?: DependencyRule;
  form?: FormGroup[];
  slots?: RHFSlotProps[];
};

export type RHFComponentMap = {
  Input: InputProps & {
    label?: string;
    description?: string;
  };
  Textarea: TextareaProps;
  Switch: SwitchProps;
  Select: SelectProps & { sort?: "ascending" | "descending" };
  Radio: RadioProps & {
    options: RHFOption[];
  };
  DatePicker: CalendarProps;
  Checkbox: {
    options: RHFOption[];
  };
  FieldArray: {
    appendText?: string;
  };
  FieldGroup: {
    appendText?: string;
    removeText?: string;
  };
  TableGroup: {
    initNumRows?: number;
    scalable?: boolean;
  };
  TextDisplay: { className?: string };
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
  appendText?: string;
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

export type TableGroupProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<T> = FieldArrayPath<T>
> = {
  control: Control<T, unknown>;
  name: TFieldArrayName;
  fields: RHFSlotProps[];
  initNumRows?: number;
  scalable?: boolean;
};

type ConditionRules =
  | {
      type: "valueExists" | "valueNotExist";
    }
  | {
      type: "expectedValue";
      expectedValue: unknown;
    };

export type Condition = { name: string } & ConditionRules;

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
  // The dependency wraper is passed two props from the checkbox button RHF used to change its value for depedency show/hide logic
  changeMethod?: (...event: any[]) => void;
  parentValue?: string[];
}
