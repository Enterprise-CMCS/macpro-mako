import { itemExists } from "@/api";
import {
  Button,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
} from "@/components";
import { useDebounce } from "@/hooks";
import { cn, zAppkWaiverNumberSchema } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import {
  Control,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { motion } from "framer-motion";
import { Loader, Plus, XIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { FAQ_TAB } from "@/router";

export const SlotWaiverId = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  state,
  onRemove,
}: {
  state: string;
  onRemove?: () => void;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({ field, fieldState }) {
    const debouncedValue = useDebounce(field.value, 750);
    const [loading, setLoading] = useState<boolean>(false);
    const context = useFormContext();

    const onValidate = useCallback(
      async (value: string) => {
        if (value.length === 0) {
          return;
        }

        setLoading(true);

        const [, currentWaiverIndex] = field.name.split(".");
        const childWaivers = context.getValues("waiverIds") || [];

        const existsInList = childWaivers
          .filter(
            (_: string, index: number) => index !== Number(currentWaiverIndex),
          )
          .includes(value);

        if (existsInList) {
          return context.setError(field.name, {
            message: "Waiver ID is already included in this Appendix K",
          });
        }

        const parsed = await zAppkWaiverNumberSchema.safeParseAsync(value);

        if (parsed.success === false) {
          const [err] = parsed.error.errors;
          return context.setError(field.name, err);
        }

        const exists = await itemExists(`${state}-${value}`);

        if (exists) {
          return context.setError(field.name, {
            message:
              "According to our records, this Waiver Amendment Number already exists. Please check the Waiver Amendment Number and try entering it again.",
          });
        }

        context.clearErrors(field.name);
      },
      [field.name, context],
    );

    useEffect(() => {
      onValidate(debouncedValue).then(() => setLoading(false));
    }, [debouncedValue]);

    return (
      <FormItem>
        <div className="relative flex gap-1 items-center">
          <div className="relative flex gap-2 items-center">
            <p className="text-sm font-semibold">{state} -</p>
            <Input
              className={cn("w-[250px]", {
                "border-red-500": fieldState.error?.message !== undefined,
                "border-green-500":
                  debouncedValue && fieldState.error?.message === undefined,
              })}
              placeholder="#####.R##.##"
              autoFocus
              onChange={(e) => {
                field.onChange({
                  target: { value: e.target.value.toUpperCase() },
                });
              }}
              value={field.value}
            />
            {loading && (
              <motion.div
                className="absolute right-[10px] inset-y-0 w-6 h-6 my-auto origin-center flex items-center justify-center"
                animate={{ rotate: "360deg" }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Loader className="w-4 h-4 text-slate-950" />
              </motion.div>
            )}
          </div>
          {onRemove ? (
            <XIcon className="cursor-pointer" size={20} onClick={onRemove} />
          ) : (
            <div className="ml-1">
              <RequiredIndicator />
            </div>
          )}
        </div>
        <FormMessage />
      </FormItem>
    );
  };

type WaiverIdFieldProps = {
  control: Control<FieldValues>;
  name: string;
  state: string | undefined;
};

export const WaiverIdField = ({ control, name, state }: WaiverIdFieldProps) => {
  const fieldArr = useFieldArray({
    control: control,
    name: name,
    shouldUnregister: true,
  });

  if (state === undefined) {
    return null;
  }

  return (
    <>
      <div>
        <div className="flex gap-x-4">
          <FormLabel className="font-bold">
            Waiver IDs <RequiredIndicator />
          </FormLabel>
          <Link
            to="/faq/waiver-c-id"
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="text-blue-900 underline"
          >
            What is my Appendix K ID?
          </Link>
        </div>
        <div className="my-1">
          Format is <strong>1111</strong>.<strong>R22</strong>.
          <strong>33</strong> or <strong>11111</strong>.<strong>R22</strong>.
          <strong>33</strong> where:
        </div>
        <ul className="pl-4 list-disc w-[600px] flex flex-col gap-1">
          <li>
            <strong>1111</strong> or <strong>11111</strong> is the four- or
            five-digit waiver initial number
          </li>
          <li>
            <strong>R22</strong> is the renewal number (Use <strong>R00</strong>{" "}
            for waivers without renewals.)
          </li>
          <li>
            <strong>33</strong> is the Appendix K amendment number (The last two
            digits relating to the number of amendments in the waiver cycle
            start with “01” and ascend.)
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 justify-start">
        <FormLabel className="w-[500px]">
          <strong>
            The first ID entered will be used to track the submission on the
            OneMAC dashboard.
          </strong>{" "}
          You will be able to find other waiver IDs entered below by searching
          for the first waiver ID.
        </FormLabel>{" "}
        <div className="flex flex-col py-2 gap-4">
          {fieldArr.fields.map((field, index) => {
            return (
              <div key={field.id} style={{ width: "max-content" }}>
                <FormField
                  control={control}
                  name={`${name}.${index}`}
                  render={SlotWaiverId({
                    ...(index && { onRemove: () => fieldArr.remove(index) }),
                    state: state,
                  })}
                />
              </div>
            );
          })}
          <Button
            disabled={!state}
            type="button"
            size="sm"
            onClick={() => fieldArr.append("")}
            variant="outline"
            className="w-[13%] mt-2"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add ID
          </Button>
        </div>
      </div>
    </>
  );
};
