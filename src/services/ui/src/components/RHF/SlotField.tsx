import {
  RHFComponentMap,
  RHFOption,
  RHFSlotProps,
  MultiselectOption,
} from "shared-types";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components";
import {
  DependencyWrapper,
  FieldGroup,
  RHFFieldArray,
  RHFFormGroup,
  RHFSlot,
  RHFTextDisplay,
} from ".";
import {
  Button,
  Calendar,
  Checkbox,
  FormControl,
  FormField,
  FormLabel,
  Input,
  Multiselect,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Upload,
} from "@/components/Inputs";

type SlotFieldProps = RHFSlotProps & { control: any; field: any };
type SelectedSubsetProps = RHFOption & {
  control: any;
  parentId?: string;
};

export const SlotField = ({
  props,
  field,
  rhf,
  text,
  control,
  parentId,
  fields,
  name,
}: SlotFieldProps) => {
  switch (rhf) {
    case "Input":
      return <Input {...props} {...field} aria-label={field.name} />;
    case "Textarea":
      return <Textarea {...props} {...field} aria-label={field.name} />;
    case "Switch":
      return <Switch {...props} {...field} aria-label={field.name} />;
    case "TextDisplay":
      return (
        <p {...props} data-testid={field.name}>
          <RHFTextDisplay text={text ?? "UNDEFINED TEXT FIELD"} />
        </p>
      );
    case "Upload":
      return (
        <Upload
          {...props}
          files={field?.value ?? []}
          setFiles={field.onChange}
        />
      );
    case "FieldArray":
      return (
        <RHFFieldArray
          control={control}
          name={name}
          fields={fields ?? []}
          parentId={parentId}
          {...props}
        />
      );
    case "FieldGroup":
      return (
        <FieldGroup
          control={control}
          name={name}
          fields={fields ?? []}
          parentId={parentId}
          {...props}
        />
      );
    case "Select": {
      const opts = props?.sort
        ? props.options.sort((a, b) => a.label.localeCompare(b.label))
        : (props as RHFComponentMap["Select"]).options;
      props?.sort === "descending" && opts.reverse();

      return (
        <Select
          {...props}
          onValueChange={field.onChange}
          defaultValue={field.value}
        >
          <SelectTrigger {...props} aria-label={field.name}>
            <SelectValue {...props} />
          </SelectTrigger>
          <SelectContent className="overflow-auto max-h-60">
            {opts?.map((OPT) => (
              <SelectItem key={`OPT-${OPT.value}`} value={OPT.value}>
                {OPT.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    case "Multiselect": {
      const options = props?.options as MultiselectOption[];
      const value = field.value as string[];

      return <Multiselect options={options} value={value} {...props} />;
    }
    case "DatePicker":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground",
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onSelect={field.onChange}
            />
          </PopoverContent>
        </Popover>
      );
    case "Checkbox":
      return (
        <div className="flex flex-col gap-2">
          {(props as RHFComponentMap["Checkbox"]).options.map((OPT) => (
            <DependencyWrapper
              name={OPT.value}
              dependency={OPT.dependency}
              changeMethod={field.onChange}
              parentValue={field.value}
              key={`CHECK-dw-${OPT.value}`}
            >
              <div key={`CHECK-${OPT.value}`}>
                <Checkbox
                  label={OPT.label}
                  value={OPT.value}
                  checked={field.value?.includes(OPT.value)}
                  styledLabel={
                    <RHFTextDisplay
                      text={(OPT.styledLabel || OPT.label) as string}
                    />
                  }
                  onCheckedChange={(c) => {
                    const filtered =
                      field.value?.filter((f: unknown) => f !== OPT.value) ||
                      [];
                    if (!c) return field.onChange(filtered);
                    field.onChange([...filtered, OPT.value]);
                  }}
                  dependency={OPT.dependency}
                  parentValue={field.value}
                  changeMethod={field.onChange}
                  aria-label={field.name}
                  optionlabelClassName={OPT.optionlabelClassName}
                />
                {field.value?.includes(OPT.value) && (
                  <OptChildren {...OPT} parentId={parentId} control={control} />
                )}
              </div>
            </DependencyWrapper>
          ))}
        </div>
      );
    case "Radio":
      return (
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
          {(props as RHFComponentMap["Radio"]).options.map((OPT) => {
            return (
              <div key={`OPT-${OPT.value}`} className="flex flex-col">
                <div className="flex gap-2">
                  <RadioGroupItem
                    value={OPT.value}
                    id={OPT.value}
                    aria-label={OPT.value}
                  />
                  {
                    <FormLabel className="font-normal mt-2" htmlFor={OPT.value}>
                      <RHFTextDisplay
                        text={(OPT.styledLabel || OPT.label) as string}
                      />
                    </FormLabel>
                  }
                </div>
                {field.value?.includes(OPT.value) && (
                  <OptChildren {...OPT} parentId={parentId} control={control} />
                )}
              </div>
            );
          })}
        </RadioGroup>
      );
  }
};

export const OptChildren = ({
  form,
  slots,
  control,
  parentId,
}: SelectedSubsetProps) => {
  return (
    <>
      {form &&
        form.map((FORM, index) => {
          return (
            <div
              className="ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary"
              key={`rhf-form-${index}-${FORM.description}`}
            >
              <RHFFormGroup
                form={FORM}
                control={control}
                parentId={parentId}
                className="py-0"
              />
            </div>
          );
        })}
      {slots &&
        slots.map((SLOT, index) => (
          <div
            className="ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary"
            key={SLOT.name + index}
          >
            <FormField
              control={control}
              name={parentId + SLOT.name}
              {...(SLOT.rules && { rules: SLOT.rules })}
              render={RHFSlot({ ...SLOT, parentId, control })}
            />
          </div>
        ))}
    </>
  );
};
