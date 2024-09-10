import { DayPicker } from "react-day-picker";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as SelectPrimitive from "@radix-ui/react-select";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  className?: string;
  classNames?: any;
  showOutsideDays?: boolean;
  defaultMonth?: Date;
};

export type DatePickerProps = {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
};

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  iconRight?: boolean;
}

export type RadioProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> & {
  className?: string;
};

export type SelectProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Root
> & {
  options?: { label: string; value: any }[];
  className?: string;
  apiCall?: string;
};

export interface MultiselectOption {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

export type MultiselectProps = {
  className?: string;
  options: MultiselectOption[];
  value?: string[];
  onChange?: (selectedValues: string[]) => void;
};

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  className?: string;
};

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  charCount?: "simple" | "limited";
  charCountClassName?: string;
}
