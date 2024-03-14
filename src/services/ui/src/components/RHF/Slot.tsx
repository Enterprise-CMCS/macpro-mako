/* eslint-disable react/prop-types */
import { useEffect, useMemo } from "react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import type { RHFSlotProps, RHFComponentMap, FormGroup } from "shared-types";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Button,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Switch,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Calendar,
  FormField,
  Checkbox,
  Upload,
} from "../Inputs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components";
import { cn } from "@/utils";
import { RHFFieldArray, FieldGroup, RHFFormGroup, RHFTextDisplay } from ".";

export const RHFSlot = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  rhf,
  label,
  description,
  descriptionAbove,
  descriptionStyling,
  name,
  props,
  text,
  labelStyling,
  formItemStyling,
  groupNamePrefix,
  ...rest
}: RHFSlotProps & { control: any }): ControllerProps<
  TFieldValues,
  TName
>["render"] =>
  function Slot({ field }) {
    // added to unregister/reset inputs when removed from dom
    useEffect(() => {
      return () => {
        control.unregister(field.name);
      };
    }, []);

    return (
      <FormItem
        className={`flex flex-col gap-1 py-2${
          formItemStyling ? ` ${formItemStyling}` : ""
        }`}
      >
        {label && (
          <FormLabel className={labelStyling}>
            <RHFTextDisplay text={label} />
          </FormLabel>
        )}
        {descriptionAbove && description && (
          <FormDescription className={descriptionStyling}>
            <RHFTextDisplay text={description} />
          </FormDescription>
        )}
        <FormControl>
          <>
            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Input" &&
              (() => {
                const hops = props as RHFComponentMap["Input"];
                return <Input {...hops} {...field} aria-label={field.name} />;
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Textarea" &&
              (() => {
                const hops = props as RHFComponentMap["Textarea"];
                return (
                  <Textarea {...hops} {...field} aria-label={field.name} />
                );
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Switch" &&
              (() => {
                const hops = props as RHFComponentMap["Switch"];
                return <Switch {...hops} {...field} aria-label={field.name} />;
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Select" &&
              (() => {
                const hops = props as RHFComponentMap["Select"];
                const opts = useMemo(() => {
                  if (hops.sort) {
                    const sorted = hops.options.sort((a, b) =>
                      a.label.localeCompare(b.label)
                    );
                    hops.sort === "descending" && sorted.reverse();
                    return sorted;
                  }
                  return hops.options;
                }, [hops.options, hops.sort]);

                return (
                  <Select
                    {...hops}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger {...hops} aria-label={field.name}>
                      <SelectValue {...hops} />
                    </SelectTrigger>
                    <SelectContent className="overflow-auto max-h-60">
                      {opts.map((OPT) => (
                        <SelectItem key={`OPT-${OPT.value}`} value={OPT.value}>
                          {OPT.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Radio" &&
              (() => {
                const hops = props as RHFComponentMap["Radio"];
                return (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {hops.options.map((OPT) => {
                      return (
                        <div key={`OPT-${OPT.value}`} className="flex flex-col">
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={OPT.value}
                              id={OPT.value}
                              aria-label={OPT.value}
                            />
                            {
                              <FormLabel
                                className="font-normal"
                                htmlFor={OPT.value}
                              >
                                <RHFTextDisplay
                                  text={OPT.styledLabel ?? OPT.label ?? ""}
                                />
                              </FormLabel>
                            }
                          </div>
                          {field.value === OPT.value &&
                            OPT.form &&
                            OPT.form.map((FORM, index) => {
                              return (
                                <div
                                  className="ml-[0.6rem] px-4 border-l-4 border-l-primary"
                                  key={`rhf-form-${index}-${FORM.description}`}
                                >
                                  <RHFFormGroup
                                    form={FORM}
                                    control={control}
                                    groupNamePrefix={groupNamePrefix}
                                  />
                                </div>
                              );
                            })}
                          {field.value === OPT.value &&
                            OPT.slots &&
                            OPT.slots.map((SLOT, index) => (
                              <div
                                className="ml-[0.6rem] px-4 border-l-4 border-l-primary"
                                key={SLOT.name + index}
                              >
                                <FormField
                                  control={control}
                                  name={(groupNamePrefix ?? "") + SLOT.name}
                                  {...(SLOT.rules && { rules: SLOT.rules })}
                                  render={RHFSlot({ ...SLOT, control })}
                                />
                              </div>
                            ))}
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Checkbox" &&
              (() => {
                const hops = props as RHFComponentMap["Checkbox"];
                return (
                  <div className="flex flex-col gap-2">
                    {hops.options.map((OPT) => (
                      <div key={`CHECK-${OPT.value}`}>
                        <Checkbox
                          label={OPT.label ?? ""}
                          value={OPT.value}
                          checked={field.value?.includes(OPT.value)}
                          styledLabel={
                            <RHFTextDisplay
                              text={OPT.styledLabel ?? OPT.label ?? ""}
                            />
                          }
                          onCheckedChange={(c) => {
                            const filtered =
                              field.value?.filter(
                                (f: unknown) => f !== OPT.value
                              ) || [];
                            if (!c) return field.onChange(filtered);
                            field.onChange([...filtered, OPT.value]);
                          }}
                          dependency={OPT.dependency}
                          parentValue={field.value}
                          changeMethod={field.onChange}
                          aria-label={field.name}
                        />
                        {field.value?.includes(OPT.value) &&
                          !!OPT.slots &&
                          OPT.slots &&
                          OPT.slots.map((SLOT, index) => (
                            <div
                              className="ml-[0.7rem] px-4 border-l-4 border-l-primary"
                              key={`rhf-form-${index}-${SLOT.name}`}
                            >
                              <FormField
                                control={control}
                                name={(groupNamePrefix ?? "") + SLOT.name}
                                {...(SLOT.rules && { rules: SLOT.rules })}
                                render={RHFSlot({ ...SLOT, control })}
                              />
                            </div>
                          ))}

                        {field.value?.includes(OPT.value) &&
                          !!OPT.form &&
                          OPT.form.map((FORM: FormGroup) => (
                            <div
                              key={`CHECK-${OPT.value}-form-${FORM.description}`}
                              className="ml-[0.7rem] px-4 border-l-4 border-l-primary"
                            >
                              <RHFFormGroup
                                control={control}
                                form={FORM}
                                groupNamePrefix={groupNamePrefix}
                              />
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                );
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "DatePicker" &&
              (() => {
                const hops = props as RHFComponentMap["DatePicker"];
                return (
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
                        {...hops}
                        selected={field.value}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                );
              })()}
            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Upload" &&
              (() => {
                const hops = props as RHFComponentMap["Upload"];

                return (
                  <Upload
                    {...hops}
                    files={field?.value ?? []}
                    setFiles={field.onChange}
                  />
                );
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "FieldArray" && (
              <RHFFieldArray
                control={control}
                name={name}
                fields={rest.fields ?? []}
                groupNamePrefix={groupNamePrefix}
                {...(props as RHFComponentMap["FieldArray"])}
              />
            )}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "FieldGroup" && (
              <FieldGroup
                control={control}
                name={name}
                fields={rest.fields ?? []}
                groupNamePrefix={groupNamePrefix}
                {...(props as RHFComponentMap["FieldGroup"])}
              />
            )}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "TextDisplay" && (
              <p {...(props as RHFComponentMap["TextDisplay"])}>
                <RHFTextDisplay text={text ?? "UNDEFINED TEXT FIELD"} />
              </p>
            )}
          </>
        </FormControl>
        {description && !descriptionAbove && (
          <RHFTextDisplay text={description} />
        )}
        <FormMessage />
      </FormItem>
    );
  };
