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
import { Grip, Plus, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { cn } from "@/utils";
import { zAppkWaiverNumberSchema } from "@/utils";
import { DragNDrop } from "./DragNDrop";

export const SlotStateSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
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
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  state,
  index,
  onRemove,
  onIncludes,
  ...props
}: {
  state: string;
  index: number;
  onRemove: () => void;
  onIncludes: (val: string) => boolean;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({ field, fieldState }) {
    const debounced = useDebounce(field.value, 750);
    const [loading, setLoading] = useState<boolean>(false);
    const context = useFormContext();

    const onValidate = async (value: string) => {
      const preExitConditions = !state || !value;
      if (preExitConditions) return;
      setLoading(true);

      const existsInList = onIncludes(String(value));
      if (existsInList) {
        return context.setError(field.name, {
          message: "Waiver id already exists",
        });
      }

      const draft = `${state}-${String(value)}`;
      const parsed = await zAppkWaiverNumberSchema.safeParseAsync(draft);

      if (!parsed.success) {
        const [err] = parsed.error.errors;
        return context.setError(field.name, err);
      }

      context.clearErrors(field.name);
    };

    useEffect(
      function onDebounceValidate() {
        onValidate(debounced).then(() => setLoading(false));
      },
      [debounced]
    );

    return (
      <I.FormItem {...props}>
        <div className="relative flex gap-1 items-center">
          <Grip size={20} className="mr-2 cursor-move" />
          <div className="relative flex gap-1 items-center">
            <I.Input
              value={state}
              readOnly
              className="w-[50px] font-bold cursor-default"
            />
            <p className="font-semibold">-</p>
            <I.Input
              className={cn({
                "w-[223px]": true,
                "border-red-500": !!fieldState.error?.message,
                "border-green-500": !!field.value && !fieldState.error?.message,
              })}
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
          {!index && <p className="ml-1 text-lg">*</p>}
          <XIcon
            size={20}
            onClick={onRemove}
            className={cn("cursor-pointer", { "opacity-0": !index })}
          />
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

  const onDragEnd = (dragItem: number, dragOver: number) => {
    fieldArr.move(dragItem, dragOver);
  };

  useEffect(() => {
    if (!props.state) return;
    fieldArr.remove();
    setTimeout(() => fieldArr.append(""), 0);
  }, [props.state]);

  return (
    <div>
      <div className="flex flex-col justify-start">
        <div className="flex flex-row gap-2 items-center">
          <I.FormLabel className="font-bold">Waivers</I.FormLabel>
          <I.Button
            disabled={!props.state}
            type="button"
            size="sm"
            onClick={() => fieldArr.append("")}
            variant="outline"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add
          </I.Button>
        </div>

        <div className="py-2 flex flex-col gap-1">
          <p className="text-gray-500 font-light">
            Must follow the format <strong>####.R##.##</strong> or{" "}
            <strong>#####.R##.##</strong>
            to include:
          </p>

          <ul className="italic text-gray-500 font-light pl-2">
            <li>##### = 4 or 5 digit waiver initial number</li>
            <li>
              R## = renewal number (R01, R02, ...) (Use R00 for waivers without
              renewals)
            </li>
            <li>## = appendix K amendment number (01)</li>
            <li>
              <strong>*</strong> ID used to represent APP-K
            </li>
          </ul>
        </div>

        <div className="flex flex-col py-4 gap-4">
          <DragNDrop onDragEnd={onDragEnd}>
            {fieldArr.fields.map((FLD, index) => {
              const inputIds = props.control._getFieldArray(props.name);

              return (
                <div key={FLD.id} style={{ width: "max-content" }}>
                  <I.FormField
                    control={props.control}
                    name={`${props.name}.${index}`}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    render={SlotWaiverId({
                      index,
                      onRemove: () => fieldArr.remove(index),
                      onIncludes: (val: string) => {
                        return inputIds
                          .filter((_: any, I: number) => I !== index)
                          .includes(val);
                      },
                      state: props.state,
                    })}
                  />
                </div>
              );
            })}
          </DragNDrop>
        </div>
      </div>
    </div>
  );
};
