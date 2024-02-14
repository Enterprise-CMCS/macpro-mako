/* eslint-disable react/prop-types */
import { useGetUser } from "@/api/useGetUser";
import { OPTIONS_STATE } from "./consts";
import * as I from "@/components/Inputs";
import {
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form";
import { ReactNode, useEffect, useState } from "react";
import { useOsSearch } from "@/api";
import { opensearch } from "shared-types";
import { DEFAULT_FILTERS } from "@/components/Opensearch/main";
import { useDebounce } from "@/hooks";
import { Plus, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { cn } from "@/lib";
import { zWaiverId } from "./consts";

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
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
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
  onRemove,
  onIncludes,
  ...props
}: {
  state: string;
  onRemove: () => void;
  onIncludes: (val: string) => boolean;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({ field }) {
    const debounced = useDebounce(field.value, 750);
    const [status, setStatus] = useState<
      "loading" | "valid" | "invalid" | "init"
    >("init");
    const search = useOsSearch<
      opensearch.main.Field,
      opensearch.main.Response
    >();

    const onValidate = async (value: string) => {
      const preExitConditions = !state || !value;
      if (preExitConditions) return;

      const parsed = zWaiverId.safeParse(String(value));
      if (!parsed.success) return setStatus("invalid");

      const includedInList = onIncludes(parsed.data);
      if (includedInList) return setStatus("invalid");

      const searchResult = await search.mutateAsync({
        index: "main",
        pagination: { number: 0, size: 100 },
        filters: [
          ...DEFAULT_FILTERS.waivers.filters!,
          {
            field: "id.keyword",
            prefix: "must",
            value: `${state}-${parsed.data}`,
            type: "match",
          },
        ],
      });
      const entryExists = searchResult.hits.total.value;
      setStatus(entryExists ? "invalid" : "valid");
    };

    useEffect(
      function onDebounceValidate() {
        onValidate(debounced);
      },
      [debounced]
    );

    useEffect(() => {
      if (!search.isLoading) return;
      setStatus("loading");
    }, [search.isLoading]);

    return (
      <I.FormItem {...props}>
        <div className="relative flex flex-row gap-1 items-center w-min">
          <p className="font-semibold">{state}-</p>
          <I.Input
            className={cn({
              "w-[223px]": true,
              "border-red-500": status === "invalid",
              "border-green-500": status === "valid",
            })}
            autoFocus
            onChange={field.onChange}
            value={field.value}
          />
          {status === "loading" && (
            <motion.div
              className="absolute right-[30px] inset-y-0 w-6 h-6 my-auto origin-center flex items-center justify-center"
              animate={{ rotate: "360deg" }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Loader className="w-4 h-4 text-slate-950" />
            </motion.div>
          )}
          <XIcon onClick={onRemove} className="cursor-pointer" />
        </div>
      </I.FormItem>
    );
  };

export const WaiverIdFieldArray = (props: any) => {
  const fieldArr = useFieldArray({
    control: props.control,
    name: props.name,
    shouldUnregister: true,
  });

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

          <ul className="italic text-gray-500 font-light">
            <li>##### = 4 or 5 digit waiver initial number</li>
            <li>
              R## = renewal number (R01, R02, ...) (Use R00 for waivers without
              renewals)
            </li>
            <li>## = appendix K amendment number (01)</li>
          </ul>
        </div>

        <div className="flex flex-col py-4 gap-4">
          {fieldArr.fields.map((FLD, index) => {
            const inputIds = props.control._getFieldArray(props.name);

            return (
              <div key={FLD.id} className="flex flex-row gap-2 items-center">
                <p className="opacity-50 font-black">·</p>
                <I.FormField
                  control={props.control}
                  name={`${props.name}.${index}`}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  render={SlotWaiverId({
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
        </div>
      </div>
    </div>
  );
};
