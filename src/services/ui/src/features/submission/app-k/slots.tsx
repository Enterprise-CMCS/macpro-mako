/* eslint-disable react/prop-types */
import { useGetUser } from "@/api/useGetUser";
import { OPTIONS_STATE } from "./consts";
import * as I from "@/components/Inputs";
import {
  ControllerProps,
  FieldPath,
  FieldValues,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { ReactNode, useEffect, useState } from "react";
import { useDebounce } from "@/hooks";
import { Plus, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { cn } from "@/utils";
import { zAppkWaiverNumberSchema } from "@/utils";
import { getItem, idIsApproved, itemExists } from "@/api";
import { Authority } from "shared-types";

export const SlotStateSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  ...props
}: {
  label: ReactNode;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({ field }) {
    const { data: user } = useGetUser();
    const stateAccess = user?.user?.["custom:state"]?.split(",");
    return (
      <I.FormItem {...props} className="w-[280px]">
        <I.FormLabel className="font-bold">{label}</I.FormLabel>
        <I.Select onValueChange={field.onChange} value={field.value}>
          <I.SelectTrigger>
            <I.SelectValue placeholder="Select State" />
          </I.SelectTrigger>
          <I.SelectContent className="overflow-auto max-h-60">
            {stateAccess?.map((STATE) => (
              <I.SelectItem key={`OPT-${STATE}`} value={STATE}>
                {OPTIONS_STATE.find((OPT) => OPT.value === STATE)?.label}
              </I.SelectItem>
            ))}
          </I.SelectContent>
        </I.Select>
      </I.FormItem>
    );
  };

export const SlotWaiverId = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  state,
  onRemove,
  ...props
}: {
  state: string;
  onRemove?: () => void;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({ field, fieldState }) {
    const debounced = useDebounce(field.value, 750);
    const [loading, setLoading] = useState<boolean>(false);
    const context = useFormContext();

    const onValidate = async (value: string) => {
      const preExitConditions = !state || !value;
      // if (preExitConditions) return context.clearErrors(field.name);
      if (preExitConditions) return;

      setLoading(true);

      if (field.name === "parentWaiver") {
        const childWaivers = context.getValues("childWaivers") || [];
        if (childWaivers?.includes(value)) {
          return context.setError(field.name, {
            message: "Waiver id already exists",
          });
        }
      }

      if (field.name.includes("childWaivers")) {
        const [_, index] = field.name.split(".");
        const childWaivers = context.getValues("childWaivers") || [];
        const parentWaiver = context.getValues("parentWaiver");
        const existsInList = childWaivers
          .filter((_: any, I: number) => I != Number(index))
          .concat(parentWaiver)
          .includes(value);

        if (existsInList) {
          return context.setError(field.name, {
            message: "Waiver id already exists",
          });
        }
      }

      const parsed = await zAppkWaiverNumberSchema.safeParseAsync(value);

      if (!parsed.success) {
        const [err] = parsed.error.errors;
        return context.setError(field.name, err);
      }
      const id = `${state}-${value}`;
      const exists = await itemExists(id);

      if (exists) {
        return context.setError(field.name, {
          message:
            "According to our records, this 1915(c) Waiver Amendment Number already exists. Please check the 1915(c) Waiver Amendment Number and try entering it again.",
        });
      }

      // lets verify the original initial or renewal waiver

      // Determine the initial or renewal waiver number from the provided amendment id
      const parts = id.split(".");
      parts.pop();
      const initialOrRenewal = `${parts.join(".")}.00`;
      console.log("ASDFASDF");
      console.log(initialOrRenewal);

      // Check that the parent exists
      if (!(await itemExists(initialOrRenewal))) {
        return context.setError(field.name, {
          message: `According to our records, there is no 1915(c) Initial or Renewal Waiver for this amendment.  Given this amenment number, we would expect ${initialOrRenewal} to exist.`,
        });
      }

      // Check that the parent is in approved status
      if (!(await idIsApproved(initialOrRenewal))) {
        return context.setError(field.name, {
          message: `According to our records, the 1915(c) Initial or Renewal Waiver for this amendment is not in Approved status.  Given this amenment number, we would expect ${initialOrRenewal} to be in Approved status`,
        });
      }

      //Check that the parent is of type 1915(c)
      const initialOrRenewalData = await getItem(initialOrRenewal);
      if (initialOrRenewalData._source.authority !== Authority["1915c"]) {
        return context.setError(field.name, {
          message: `The Initial or Renewal Waiver for this amendment is not of authority 1915(c).  Given this amenment number, we would expect ${initialOrRenewal} to be of authority 1915(c)`,
        });
      }

      context.clearErrors(field.name);
    };

    useEffect(() => {
      onValidate(debounced).then(() => setLoading(false));
    }, [debounced]);

    return (
      <I.FormItem {...props}>
        <div className="relative flex gap-1 items-center">
          <div className="relative flex gap-2 items-center">
            <p className="text-sm font-semibold">{state} -</p>
            <I.Input
              className={cn({
                "w-[250px]": true,
                "border-red-500": !!fieldState.error?.message,
                "border-green-500": !!debounced && !fieldState.error?.message,
              })}
              placeholder="#####.R##.##"
              autoFocus
              onChange={field.onChange}
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
          {onRemove && (
            <XIcon size={20} onClick={onRemove} className={"cursor-pointer"} />
          )}
        </div>
        <I.FormMessage />
      </I.FormItem>
    );
  };

export const WaiverIdFieldArray = (props: any) => {
  const fieldArr = useFieldArray({
    control: props.control,
    name: props.name,
    shouldUnregister: true,
  });

  return (
    <div>
      <div className="flex flex-col gap-2 justify-start">
        <div className="flex flex-col gap-1">
          <I.FormLabel className="font-bold">
            Control Numbers (optional)
          </I.FormLabel>
          <I.FormLabel>
            Other waiver IDs that will be associated with the APP-K
          </I.FormLabel>
        </div>

        <div className="flex flex-col py-2 gap-4">
          {fieldArr.fields.map((FLD, index) => {
            return (
              <div key={FLD.id} style={{ width: "max-content" }}>
                <I.FormField
                  control={props.control}
                  name={`${props.name}.${index}`}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  render={SlotWaiverId({
                    onRemove: () => fieldArr.remove(index),
                    state: props.state,
                  })}
                />
              </div>
            );
          })}
          <I.Button
            disabled={!props.state}
            type="button"
            size="sm"
            onClick={() => fieldArr.append("")}
            variant="outline"
            className="w-[100px]"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add
          </I.Button>
        </div>
      </div>
    </div>
  );
};
