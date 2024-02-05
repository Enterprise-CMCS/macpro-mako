/* eslint-disable react/prop-types */
import { useGetUser } from "@/api/useGetUser";
import { BreadCrumbs, SectionCard, SimplePageContainer } from "@/components";
import { useLocationCrumbs } from "@/pages/form/form-breadcrumbs";
import { Select } from "@/components/Inputs";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Inputs";
import { OPTIONS_STATE } from "./consts";
import * as I from "@/components/Inputs";
import * as C from "@/pages/form/content";
import { z } from "zod";
import { zAttachmentRequired, zSpaIdSchema } from "@/pages/form/zod";
import {
  useForm,
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { useOsSearch } from "@/api";
import { opensearch } from "shared-types";
import { DEFAULT_FILTERS } from "@/components/Opensearch/main";
import { useDebounce } from "@/hooks";
import { Plus, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { cn } from "@/lib";
import { SlotAttachments } from "@/pages/actions/renderSlots";

const formSchema = z.object({
  waiverIds: z.array(zSpaIdSchema),
  state: z.string(),
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    appk: zAttachmentRequired({ min: 1 }),
  }),
  proposedEffectiveDate: z.date(),
});
type ChipFormSchema = z.infer<typeof formSchema>;

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
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="overflow-auto max-h-60">
            {stateAccess?.map((STATE) => (
              <SelectItem key={`OPT-${STATE}`} value={STATE}>
                {OPTIONS_STATE.find((OPT) => OPT.value === STATE)?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </I.FormItem>
    );
  };

export const SlotWaiverId = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  state,
  onRemove,
  ...props
}: {
  state: string;
  onRemove: () => void;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({ field }) {
    const debounced = useDebounce(field.value, 750);
    const [status, setStatus] = useState<
      "loading" | "valid" | "invalid" | "fresh"
    >("fresh");
    const search = useOsSearch<
      opensearch.main.Field,
      opensearch.main.Response
    >();

    const onValidate = async (value: string) => {
      if (!state) return;
      if (!value) return;
      if (!String(value).match(/\d{4,5}.R00.00$/)) {
        return setStatus("invalid");
      }

      const res = await search.mutateAsync({
        index: "main",
        pagination: { number: 0, size: 100 },
        filters: [
          ...DEFAULT_FILTERS.waivers.filters!,
          {
            field: "id.keyword",
            prefix: "must",
            value: `${state}-${value}`,
            type: "match",
          },
        ],
      });

      setStatus(res.hits.total.value ? "invalid" : "valid");
    };

    useEffect(() => {
      onValidate(debounced);
    }, [debounced]);

    useEffect(() => {
      if (!search.isLoading) return;
      setStatus("loading");
    }, [search.isLoading]);

    return (
      <I.FormItem {...props}>
        <div className="relative flex flex-row gap-1 items-center w-min">
          <p className="font-semibold">{state}-</p>
          <I.Input
            // className={"outline-1 border-red-500"}
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
            return (
              <div
                key={`${props.name}.${index}`}
                className="flex flex-row gap-2 items-center"
              >
                <p className="opacity-50 font-black">·</p>
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
        </div>
      </div>
    </div>
  );
};

export const AppKSubmissionForm = () => {
  const crumbs = useLocationCrumbs();

  const form = useForm<ChipFormSchema>({
    resolver: zodResolver(formSchema),
  });

  return (
    <SimplePageContainer>
      <BreadCrumbs options={crumbs} />
      <div className="my-6 space-y-8 mx-auto justify-center items-center flex flex-col">
        <I.Form {...form}>
          <SectionCard title="Appendix K Details">
            <I.FormField
              control={form.control}
              name="state"
              render={SlotStateSelect({ label: "State" })}
            />
            <div className="px-4 border-l-2">
              <WaiverIdFieldArray
                {...form}
                state={form.watch("state")}
                name="waiverIds"
              />
            </div>
            <I.FormField
              control={form.control}
              name="proposedEffectiveDate"
              render={({ field }) => (
                <I.FormItem className="max-w-sm">
                  <I.FormLabel className="text-lg font-bold block">
                    Proposed Effective Date of CHIP SPA
                  </I.FormLabel>
                  <I.FormControl>
                    <I.DatePicker
                      onChange={field.onChange}
                      date={field.value}
                    />
                  </I.FormControl>
                  <I.FormMessage />
                </I.FormItem>
              )}
            />
          </SectionCard>
          <SectionCard title="Attachments">
            <C.AttachmentsSizeTypesDesc faqLink="/faq/#chip-spa-attachments" />

            <I.FormField
              key={String(name)}
              control={form.control}
              name={"attachments.appk"}
              render={SlotAttachments({
                label: (
                  <I.FormLabel className="font-semibold">
                    {"1915(c) Appendix K Amendment Waiver Template"}
                    <I.RequiredIndicator />
                  </I.FormLabel>
                ),
                message: <I.FormMessage />,
                className: "my-4",
              })}
            />
          </SectionCard>

          <SectionCard title="Additional Information">
            <I.FormField
              control={form.control}
              name="additionalInformation"
              render={({ field }) => (
                <I.FormItem>
                  <I.FormLabel className="font-normal">
                    Add anything else you would like to share with CMS, limited
                    to 4000 characters
                  </I.FormLabel>
                  <I.Textarea {...field} className="h-[200px] resize-none" />
                  <I.FormDescription>
                    4,000 characters allowed
                  </I.FormDescription>
                </I.FormItem>
              )}
            />
          </SectionCard>
          <C.PreSubmissionMessage />
        </I.Form>
      </div>
    </SimplePageContainer>
  );
};
