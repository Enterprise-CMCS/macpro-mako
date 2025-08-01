import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";

import { EditableText, FormControl, FormField, FormItem, FormMessage } from "@/components";

const DEFAULT_SUFFIXES = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
  5: "E",
  6: "F",
  7: "G",
};

const SplitSpaId = ({ spaId, control, index, ...props }) => (
  <FormField
    {...props}
    control={control}
    name={`spaIds.${index}.suffix`}
    key={`spaIds.${index}`}
    render={({ field }) => (
      <FormItem className="max-w-sm">
        <FormControl>
          <div className="items-center flex leading-[2.25]">
            <span className="font-bold mr-4">{index}.</span>
            <span>{spaId}</span>
            <span className="flex">
              -
              <EditableText
                ref={field.ref}
                id={field.name}
                key={field.name}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              />
            </span>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const SplitSpaIdForm = ({ control, spaId, splitCount }) => {
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "spaIds", // unique name for your Field Array
  });

  useEffect(() => {
    remove();
    [...Array(splitCount).keys()].splice(1).map((index) => {
      const value = DEFAULT_SUFFIXES[index];
      append({ suffix: value });
    });
  }, [splitCount]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!splitCount) {
    return;
  }

  return (
    <section className="flex flex-col space-y-2">
      <div className="font-bold">SPAs after split</div>
      <div className="items-center flex leading-[2.25]">
        <span className="font-bold mr-4">1.</span>
        <span>{spaId}</span>
        <span className="flex ml-1">
          (<span className="font-bold">Base SPA</span>)
        </span>
      </div>
      {fields.map((field, index) => (
        <SplitSpaId key={field.id} spaId={spaId} {...{ control, index }} />
      ))}
    </section>
  );
};
