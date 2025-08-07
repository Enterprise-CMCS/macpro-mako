import { useEffect } from "react";
import { Control, useFieldArray } from "react-hook-form";

import {
  EditableText,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components";

const DEFAULT_SUFFIXES = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
  5: "E",
  6: "F",
  7: "G",
};

const SplitSpaId = ({ control, index, spaId, ...props }) => (
  <FormField
    {...props}
    control={control}
    name={`spaIds.${index}.suffix`}
    key={`spaIds.${index}`}
    render={({ field }) => (
      <FormItem className="max-w-sm">
        <FormControl>
          <div
            className="items-center flex leading-[2.25]"
            data-testid={`${index + 2}. ${spaId}-${field.value}`}
          >
            <FormDescription>
              <span className="font-bold mr-4">{index + 2}.</span>
              <span>{spaId}</span>
            </FormDescription>
            <span className="flex">
              -
              <EditableText
                label={`${spaId} split number ${index + 2}`}
                onValueChange={field.onChange}
                {...field}
              />
            </span>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const SplitSpaIdsForm = ({
  control,
  spaId,
  splitCount,
}: {
  control: Control;
  spaId: string;
  splitCount: number;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "spaIds",
  });

  useEffect(() => {
    remove();
    const fields = [...Array(splitCount).keys()]
      .splice(1)
      .map((index) => ({ suffix: DEFAULT_SUFFIXES[index] }));
    append(fields);
  }, [splitCount]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!spaId || !splitCount || splitCount < 2 || splitCount > 8) {
    return;
  }

  return (
    <section className="flex flex-col space-y-2">
      <div className="font-bold">SPAs after split</div>
      <div className="items-center flex leading-[2.25]" data-testid={`1. ${spaId} (Base SPA)`}>
        <span className="font-bold mr-4">1.</span>
        <span>{spaId}</span>
        <span className="flex ml-1">
          (<span className="font-bold">Base SPA</span>)
        </span>
      </div>
      {fields.map((field, index) => (
        <SplitSpaId control={control} index={index} spaId={spaId} {...field} />
      ))}
    </section>
  );
};
