import {
  Control,
  FieldArrayPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import {
  CalendarProps,
  InputProps,
  MultiselectProps,
  RadioProps,
  SelectProps,
  SwitchProps,
  TextareaProps,
} from "shared-types";

export interface FormSchema {
  header: string;
  subheader?: string;
  formId: string;
  sections: Section[];
}

export type AdditionalRule =
  | {
      type: "lessThanField" | "greaterThanField";
      strictGreater?: boolean;
      fieldName: string;
      message: string;
    }
  | {
      type: "cannotCoexist";
      fieldName: string;
      message: string;
    }
  | {
      type: "noGapsOrOrverlaps";
      fieldName: string;
      fromField: string;
      toField: string;
      options: { value: string; label: string }[];
    }
  | {
      type: "toGreaterThanFrom";
      fieldName: string;
      fromField: string;
      toField: string;
      message: string;
    };

export type RuleGenerator = (
  rules?: RegisterOptions,
  addtnlRules?: AdditionalRule[],
) => RegisterOptions | undefined;

export type RHFSlotProps = {
  name: string;
  label?: RHFTextField;
  index?: number;
  labelClassName?: string;
  styledLabel?: RHFTextField;
  formItemClassName?: string;
  parentId?: string;
  description?: RHFTextField;
  descriptionAbove?: boolean;
  descriptionClassName?: string;
  dependency?: DependencyRule;
  rules?: RegisterOptions;
  addtnlRules?: AdditionalRule[];
  horizontalLayout?: boolean;
} & {
  [K in keyof RHFComponentMap]: {
    rhf: K;
    props?: RHFComponentMap[K];
    text?: K extends "TextDisplay" ? RHFTextField : never;
    fields?: K extends "FieldArray" | "WrappedGroup" ? RHFSlotProps[] : never;
  };
}[keyof RHFComponentMap];

export type RHFTextField =
  | Array<
      | {
          text?: string;
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

type RHFTextItemType =
  | "br"
  | "brWrap"
  | "link"
  | "bold"
  | "italic"
  | "list"
  | "numberedSet"
  | "default";

export type RHFOption = {
  label?: string;
  value: string;
  styledLabel?: RHFTextField;
  dependency?: DependencyRule;
  form?: FormGroup[];
  slots?: RHFSlotProps[];
  optionlabelClassName?: string;
};

export type SortFuncs = "noSort" | "reverseSort";

export type RHFComponentMap = {
  Input: InputProps & {
    label?: string;
    description?: string;
  };
  Textarea: TextareaProps;
  Switch: SwitchProps;
  Select: SelectProps & { customSort?: SortFuncs };
  Multiselect: MultiselectProps;
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
    removeText?: string;
    fieldArrayClassName?: string;
    divider?: boolean;
    lastDivider?: string;
    appendClassName?: string;
    appendVariant?: "default" | "outline" | "ghost" | "secondary";
  };
  TextDisplay: { className?: string };
  WrappedGroup: { wrapperClassName?: string };
  Divider: { wrapperClassName?: string };
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
  sectionId: string;
  sectionWrapperClassname?: string;
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
  rhf: keyof RHFComponentMap;
  name: TFieldArrayName;
  fields: RHFSlotProps[];
  parentId?: string;
  appendText?: string;
  removeText?: string;
  fieldArrayClassName?: string;
  divider?: boolean;
  lastDivider?: string;
  appendClassName?: string;
  appendVariant?: "default" | "outline" | "ghost" | "secondary";
};

// old default values for fieldGroups
export const DefaultFieldGroupProps: RHFComponentMap["FieldArray"] = {
  appendText: "New Group",
  appendVariant: "default",
  appendClassName: "self-end ",
  removeText: "Remove Group",
  fieldArrayClassName: "flex-col ",
  divider: true,
};

type ConditionRules =
  | {
      type: "valueExists" | "valueNotExist";
    }
  | {
      type: "expectedValue" | "notBadValue" | "notOnlyBadValue";
      expectedValue: unknown;
    };

export type Condition = { name: string } & ConditionRules;

type Effects =
  | {
      type: "show" | "hide";
    }
  | {
      type: "setValue";
      newValue: string | string[];
      fieldName: string;
      checkUnique?: boolean;
    };

export interface DependencyRule {
  conditions: Condition[];
  effect: Effects;
  looseConditions?: boolean;
}

export interface DependencyWrapperProps {
  name?: string;
  dependency?: DependencyRule;
  // The dependency wraper is passed two props from the checkbox button RHF used to change its value for depedency show/hide logic
  changeMethod?: (...event: any[]) => void;
  parentValue?: string[];
}
