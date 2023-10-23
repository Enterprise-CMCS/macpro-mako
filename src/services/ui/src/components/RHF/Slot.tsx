/* eslint-disable react/prop-types */
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
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
} from "../Inputs";
import { RHFFormGroup } from "./FormGroup";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { cn } from "@/lib";
import { format } from "date-fns";
import { RHFFieldArray } from "./FieldArray";
import { FieldGroup } from "./FieldGroup";
import type { RHFSlotProps, RHFComponentMap } from "./types";

export const RHFSlot = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  rhf,
  label,
  description,
  name,
  props,
  labelStyling,
  ...rest
}: RHFSlotProps & { control: any }): ControllerProps<
  TFieldValues,
  TName
>["render"] =>
  function Slot({ field }) {
    return (
      <FormItem className="flex flex-col gap-1 py-2">
        {label && <FormLabel className={labelStyling}>{label}</FormLabel>}
        <FormControl>
          <>
            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Input" &&
              (() => {
                const hops = props as RHFComponentMap["Input"];
                return <Input {...hops} {...field} />;
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Textarea" &&
              (() => {
                const hops = props as RHFComponentMap["Textarea"];
                return <Textarea {...hops} {...field} />;
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Switch" &&
              (() => {
                const hops = props as RHFComponentMap["Switch"];
                return <Switch {...hops} {...field} />;
              })()}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "Select" &&
              (() => {
                const hops = props as RHFComponentMap["Select"];
                return (
                  <Select
                    {...hops}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger {...hops}>
                      <SelectValue {...hops} />
                    </SelectTrigger>
                    <SelectContent>
                      {hops.options.map((OPT: any) => (
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
                    {hops.options.map((OPT: any) => {
                      return (
                        <div key={`OPT-${OPT.value}`} className="flex flex-col">
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem value={OPT.value} />
                            <FormLabel className="font-normal">
                              {OPT.label}
                            </FormLabel>
                          </div>
                          {field.value === OPT.value &&
                            OPT.form &&
                            OPT.form.map((FORM: any, index: any) => (
                              <div
                                className="ml-[0.6rem] px-4 border-l-4 border-l-primary"
                                key={`rhf-form-${index}-${FORM.description}`}
                              >
                                <RHFFormGroup form={FORM} control={control} />
                              </div>
                            ))}
                          {field.value === OPT.value &&
                            OPT.slots &&
                            OPT.slots.map((SLOT: any, index: any) => (
                              <div
                                className="ml-[0.6rem] px-4 border-l-4 border-l-primary"
                                key={SLOT.name + index}
                              >
                                <FormField
                                  control={control}
                                  name={SLOT.name}
                                  render={RHFSlot(SLOT)}
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
                    {hops.options.map((OPT: any) => (
                      <div key={`CHECK-${OPT.value}`}>
                        <Checkbox
                          label={OPT.label}
                          checked={field.value?.includes(OPT.value)}
                          onCheckedChange={(c) => {
                            const filtered =
                              field.value?.filter(
                                (f: any) => f !== OPT.value
                              ) || [];
                            if (!c) return field.onChange(filtered);
                            field.onChange([...filtered, OPT.value]);
                          }}
                        />
                        {field.value?.includes(OPT.value) &&
                          !!OPT.slots &&
                          OPT.slots &&
                          OPT.slots.map((SLOT: any, index: any) => (
                            <div
                              className="ml-[0.7rem] px-4 border-l-4 border-l-primary"
                              key={`rhf-form-${index}-${SLOT.name}`}
                            >
                              <FormField
                                control={control}
                                name={SLOT.name}
                                render={RHFSlot(SLOT)}
                              />
                            </div>
                          ))}

                        {field.value?.includes(OPT.value) &&
                          !!OPT.form &&
                          OPT.form.map((FORM: any) => (
                            <div
                              key={`CHECK-${OPT.value}-form-${FORM.description}`}
                              className="ml-[0.7rem] px-4 border-l-4 border-l-primary"
                            >
                              <RHFFormGroup control={control} form={FORM} />
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
            {rhf === "FieldArray" && (
              <RHFFieldArray
                control={control}
                name={name}
                fields={rest.fields ?? []}
              />
            )}

            {/* ----------------------------------------------------------------------------- */}
            {rhf === "FieldGroup" && (
              <FieldGroup
                control={control}
                name={name}
                fields={rest.fields ?? []}
                {...(props as RHFComponentMap["FieldGroup"])}
              />
            )}
          </>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  };
