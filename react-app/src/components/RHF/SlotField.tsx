import {
  RHFComponentMap,
  RHFOption,
  RHFSlotProps,
  MultiselectOption,
} from "shared-types";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useUserContext,
} from "@/components";
import {
  DependencyWrapper,
  RHFFieldArray,
  RHFFormGroup,
  RHFSlot,
  RHFTextDisplay,
  ruleGenerator,
  sortFunctions,
  stringCompare,
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
  horizontalLayout,
  index,
}: SlotFieldProps) => {
  const userContext = useUserContext();

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
          <RHFTextDisplay text={text ?? "UNDEFINED TEXT FIELD"} index={index} />
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
          rhf={rhf}
          fields={fields ?? []}
          parentId={parentId}
          {...props}
        />
      );
    case "Select": {
      let opts;
      switch (props?.apiCall) {
        case undefined:
          opts = props?.options?.sort((a, b) =>
            props.customSort
              ? sortFunctions[props.customSort](a.label, b.label)
              : stringCompare(a, b),
          );
          break;

        case "countySelect":
          opts =
            userContext?.counties?.sort((a, b) =>
              props.customSort
                ? sortFunctions[props.customSort](a.label, b.label)
                : stringCompare(a, b),
            ) || [];
          break;
      }

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

      return (
        <Multiselect
          options={options}
          value={value}
          onChange={(selectedValues) => field.onChange(selectedValues)}
          {...props}
        />
      );
    }
    case "DatePicker":
      return (
        <FormControl>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] pl-3 text-left font-normal text-[#212121] justify-start",
                  !field.value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-4" />
                {field.value ? (
                  format(new Date(field.value), "MM/dd/yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                {...props}
                mode="single"
                selected={field.value && new Date(field.value)}
                defaultMonth={field.value && new Date(field.value)}
                onSelect={(date) => field.onChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormControl>
      );
    case "Checkbox":
      return (
        <div className="flex flex-col gap-3">
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
          className={`flex  ${
            horizontalLayout ? "pl-5 gap-5" : "flex-col space-y-6"
          }`}
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
                    <FormLabel className="font-normal" htmlFor={OPT.value}>
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
    case "WrappedGroup":
      return (
        <div className={props?.wrapperClassName}>
          {fields?.map((S, i) => {
            return (
              <DependencyWrapper {...S}>
                <FormField
                  key={`wrappedSlot-${i}`}
                  control={control}
                  name={parentId + S.name}
                  rules={ruleGenerator(S.rules, S.addtnlRules)}
                  render={RHFSlot({ ...S, control, parentId })}
                />
              </DependencyWrapper>
            );
          })}
        </div>
      );
    case "Divider":
      return (
        <div
          className={cn(
            "w-full border-slate-400 border-2",
            props?.wrapperClassName,
          )}
        />
      );
  }
};

export const OptChildren = ({
  form,
  slots,
  control,
  parentId,
}: SelectedSubsetProps) => {
  const childClasses =
    "ml-[0.6rem] mt-4 pl-6 px-4 space-y-6 border-l-4 border-l-primary";

  return (
    <>
      {form && (
        <div className={childClasses}>
          {form.map((FORM, index) => (
            <div key={`rhf-form-${index}-${FORM.description}`}>
              <RHFFormGroup
                form={FORM}
                control={control}
                parentId={parentId}
                className="py-0"
              />
            </div>
          ))}
        </div>
      )}
      {slots && (
        <div className={childClasses}>
          {slots.map((SLOT, index) => (
            <div key={SLOT.name + index}>
              <FormField
                control={control}
                name={parentId + SLOT.name}
                rules={ruleGenerator(SLOT.rules, SLOT.addtnlRules)}
                render={RHFSlot({ ...SLOT, control, parentId })}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
