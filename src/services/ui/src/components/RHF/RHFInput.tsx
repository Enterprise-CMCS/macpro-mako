/* eslint-disable react/prop-types */
import {
  Control,
  Controller,
  ControllerProps,
  FieldArrayPath,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form";
import type { ReactElement } from "react";
import {
  Button,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputProps,
  Switch,
  SwitchProps,
  Textarea,
  TextareaProps,
  Select,
  SelectProps,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioProps,
  RadioGroup,
  RadioGroupItem,
  Calendar,
  CalendarProps,
  FormField,
  CheckboxGroup,
  Checkbox,
} from "../Inputs";
import { CalendarIcon, Trash2, TrashIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { cn } from "@/lib";
import { format } from "date-fns";
import { Chip } from "../Chip";

type TextFieldProps = InputProps & {
  label?: ReactElement | string;
  description?: ReactElement | string;
};

type ComponentKey = keyof RHFComponentMap;

type RHFSlotProps<T extends ComponentKey = any> = {
  rhf: ComponentKey;
  name: string;
  label?: ReactElement | string;
  description?: ReactElement | string;
} & RHFComponentMap[T];

type RHFComponentMap = {
  Text: TextFieldProps;
  Textarea: TextareaProps;
  Switch: SwitchProps;
  Select: SelectProps;
  Radio: RadioProps;
  DatePicker: CalendarProps;
  Checkbox: any;
  FieldArray: any;
  //   "Checkbox":''
};

type FormGroup = {
  description: string;
  slot: RHFSlotProps;
};

export interface Section {
  title: string;
  form: FormGroup[];
}

export interface Document {
  header: string;
  sections: Section[];
}

type FieldArrayProps<
  T extends FieldValues,
  TFieldArrayName extends FieldArrayPath<T> = FieldArrayPath<T>
> = {
  control: Control<T, any>;
  name: TFieldArrayName;
  fields: RHFSlotProps<any>[];
};

// -----------------------------------------------------------------
export const RadioGroup_ = (props) => {
  return (
    <RadioGroup {...props} className="flex flex-col space-y-1">
      {props.options.map((OPT) => (
        <div key={`OPT-${OPT.value}`} className="flex gap-2">
          <RadioGroupItem value={OPT.value} />
          <FormLabel className="font-normal">{OPT.label}</FormLabel>
          {props.value === OPT.value &&
            props.form &&
            props.form.map((FORM, index) => (
              <RHFFormGroup
                form={FORM}
                key={`rhf-form-${index}-${FORM.description}`}
                control={props}
              />
            ))}
        </div>
      ))}
    </RadioGroup>
  );
};

// export const CheckboxGroup_ = (props) => {
//   return (
//     <div className="flex flex-col gap-2">
//       {props.options.map((OPT) => (
//         <div key={`CHECK-${OPT.value}`}>
//           <Checkbox
//             label={OPT.label}
//             checked={props.value.includes(OPT.value)}
//             onCheckedChange={(c) => {
//               const filtered = props.value.filter((f) => f !== OPT.value);
//               if (!c) return props.onChange(filtered);
//               props.onChange([...filtered, OPT.value]);
//             }}
//           />
//           {props.value.includes(OPT.value) && !!OPT.slot && (
//             <FormField
//               control={props.control}
//               name={OPT.slot.name}
//               render={RHFSlot(props.form.slot)}
//             />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

export const RHFSlot = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  rhf,
  label,
  description,
  ...props
}: RHFSlotProps<ComponentKey>): ControllerProps<
  TFieldValues,
  TName
>["render"] =>
  function Slot({ field }) {
    return (
      <FormItem className="flex flex-col gap-1">
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <>
            {rhf === "Input" && <Input {...props} {...field} />}
            {rhf === "Textarea" && <Textarea {...props} {...field} />}
            {rhf === "Switch" && <Switch {...props} {...field} />}
            {rhf === "Select" && (
              <Select
                {...props}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger {...props}>
                  <SelectValue placeholder="Select a verified email to display" />
                </SelectTrigger>
                <SelectContent>
                  {props.options.map((OPT) => (
                    <SelectItem key={`OPT-${OPT.value}`} value={OPT.value}>
                      {OPT.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {rhf === "Radio" && (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {props.options.map((OPT) => (
                  <div key={`OPT-${OPT.value}`} className="flex flex-col">
                    <div className="flex gap-2">
                      <RadioGroupItem value={OPT.value} />
                      <FormLabel className="font-normal">{OPT.label}</FormLabel>
                    </div>
                    {field.value === OPT.value &&
                      OPT.form &&
                      OPT.form.map((FORM, index) => (
                        <div
                          className="ml-2 p-4 border-l-2 border-l-primary"
                          key={`rhf-form-${index}-${FORM.description}`}
                        >
                          <RHFFormGroup form={FORM} control={props.control} />
                        </div>
                      ))}

                    {field.value === OPT.value && OPT.slot && (
                      <div className="ml-2 p-4 border-l-2 border-l-primary">
                        <FormField
                          control={props.control}
                          name={OPT.slot.name}
                          render={RHFSlot(OPT.slot)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
              // <RadioGroup_
              //   control={control}
              //   onValueChange={field.onChange}
              //   defaultValue={field.value}
              //   options={props.options}
              //   {...props}
              // />
            )}

            {rhf === "FieldArray" && (
              <FieldArray
                control={props.control}
                name={props.name as any}
                fields={props.fields}
              />
            )}

            {rhf === "Checkbox" && (
              <div className="flex flex-col gap-2">
                {props.options.map((OPT) => (
                  <div key={`CHECK-${OPT.value}`}>
                    <Checkbox
                      label={OPT.label}
                      checked={field.value?.includes(OPT.value)}
                      onCheckedChange={(c) => {
                        const filtered = field.value?.filter(
                          (f) => f !== OPT.value
                        );
                        if (!c) return field.onChange(filtered);
                        field.onChange([...filtered, OPT.value]);
                      }}
                    />
                    {field.value?.includes(OPT.value) && !!OPT.slot && (
                      <div className="ml-2 p-4 border-l-2 border-l-primary">
                        <FormField
                          control={props.control}
                          name={OPT.slot.name}
                          render={RHFSlot(OPT.slot)}
                        />
                      </div>
                    )}

                    {field.value?.includes(OPT.value) &&
                      !!OPT.form &&
                      OPT.form.map((FORM) => (
                        <div
                          key={`CHECK-${OPT.value}-form-${FORM.description}`}
                          className="ml-2 p-4 border-l-2 border-l-primary"
                        >
                          <RHFFormGroup control={props.control} form={FORM} />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}

            {rhf === "DatePicker" && (
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    {...props}
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
            )}
          </>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  };

export const RHFFormGroup = <TFieldValues extends FieldValues>(props: {
  form: FormGroup;
  control: Control<TFieldValues>;
}) => {
  return (
    <div className="py-4">
      <div className="mb-6">
        <FormLabel className="font-bold">{props.form?.description}</FormLabel>
      </div>
      <FormField
        control={props.control}
        name={props.form.slot.name}
        render={RHFSlot(props.form.slot)}
      />
    </div>
  );
};

export const RHFSection = <TFieldValues extends FieldValues>(props: {
  section: Section;
  control: Control<TFieldValues>;
}) => {
  return (
    <div className="py-4">
      <div className="mb-6">
        <FormLabel className="font-bold">{props.section.title}</FormLabel>
      </div>
      {props.section.form.map((FORM, index) => (
        <RHFFormGroup
          key={`rhf-form-${index}-${FORM.description}`}
          control={props.control}
          form={FORM}
        />
      ))}
    </div>
  );
};

export const RHFDocument = <TFieldValues extends FieldValues>(props: {
  document: Document;
  control: Control<TFieldValues>;
}) => {
  return (
    <div className="py-4">
      <div className="mb-6">
        <FormLabel className="font-bold">{props.document.header}</FormLabel>
      </div>
      {props.document.sections.map((SEC, index) => (
        <RHFSection
          key={`rhf-section-${index}-${SEC.title}`}
          control={props.control}
          section={SEC}
        />
      ))}
    </div>
  );
};

export const FieldArray = <TFields extends FieldValues>(
  props: FieldArrayProps<TFields>
) => {
  const fieldArr = useFieldArray({
    control: props.control,
    name: props.name,
  });

  const onAppend = () => {
    fieldArr.append(
      props.fields.reduce((ACC, S) => {
        ACC[S.name] = "";
        return ACC;
      }, {})
    );
  };

  return (
    <div className="flex flex-col gap-2 w-max">
      {fieldArr.fields.map((FLD, index) => {
        return (
          <div className="flex flex-row gap-3" key={FLD.id}>
            {props.fields.map((SLOT) => {
              return (
                <FormField
                  //   shouldUnregister
                  key={`${SLOT.name}-${index}`}
                  control={props.control}
                  name={`${props.name}.${index}.${SLOT.name}`}
                  render={RHFSlot(SLOT)}
                />
              );
            })}
            <Trash2
              color="gray"
              className="self-end mb-2 cursor-pointer"
              onClick={() => fieldArr.remove(index)}
            />
          </div>
        );
      })}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1 h-1 border-b-[2px]" />
        <Button type="button" size="sm" onClick={onAppend}>
          + New row
        </Button>
        <div className="flex-1 h-1 border-b-[2px]" />
      </div>
    </div>
  );
};
