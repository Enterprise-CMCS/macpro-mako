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
  label?: RHFTextField;
  labelClassName?: string;
  formItemClassName?: string;
  groupNamePrefix?: string;
  description?: RHFTextField;
  descriptionAbove?: boolean;
  descriptionClassName?: string;
  dependency?: DependencyRule;
  rules?: RegisterOptions;
} & {
  [K in keyof RHFComponentMap]: {
    rhf: K;
    props?: RHFComponentMap[K];
    text?: K extends "TextDisplay" ? RHFTextField : never;
    fields?: K extends "FieldArray"
      ? RHFSlotProps[]
      : K extends "FieldGroup"
        ? RHFSlotProps[]
        : never;
  };
}[keyof RHFComponentMap];

export type RHFTextField =
  | Array<
      | {
          text: string;
          type?: RHFTextItemType;
          link?: string;
          listType?: "ordered" | "unordered";
          list?: RHFTextListItem[];
          classname?: string;
        }
      | string
    >
  | string;

export type RHFTextListItem = {
  text: string;
  list?: RHFTextListItem[];
  listType?: "ordered" | "unordered";
  classname?: string;
  type?: RHFTextItemType;
  link?: string;
};

type RHFTextItemType = "br" | "brWrap" | "link" | "bold" | "italic" | "list";

export type RHFOption = {
  label: string;
  value: string;
  styledLabel?: RHFTextField;
  dependency?: DependencyRule;
  form?: FormGroup[];
  slots?: RHFSlotProps[];
  optionlabelClassName?: string;
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
  Upload: {
    maxFiles?: number;
    maxSize?: number;
  };
  FieldArray: {
    appendText?: string;
  };
  FieldGroup: {
    appendText?: string;
    removeText?: string;
  };
  TextDisplay: { className?: string };
};

export type FormGroup = {
  description?: string;
  descriptionClassName?: string;
  slots: RHFSlotProps[];
  wrapperClassName?: string;
  dependency?: DependencyRule;
};

export interface Section {
  title: string;
  form: FormGroup[];
  dependency?: DependencyRule;
  subsection?: boolean;
}

export interface Document {
  header: string;
  sections: Section[];
}

export type FieldArrayProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<T> = FieldArrayPath<T>,
> = {
  control: Control<T, unknown>;
  name: TFieldArrayName;
  fields: RHFSlotProps[];
  groupNamePrefix?: string;
  appendText?: string;
};

export type FieldGroupProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<T> = FieldArrayPath<T>,
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
