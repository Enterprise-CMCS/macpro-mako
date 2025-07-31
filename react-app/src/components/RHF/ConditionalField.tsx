import * as React from "react";
import { useWatch } from "react-hook-form";

import { FormField } from "@/components";

const ConditionalField = ({ name, control, render, ...props }) => {
  const value = useWatch({
    name,
    control,
  });

  return (
    <FormField name={name} control={control} render={render} value={value) {...props} />
    // <Controller
    //   control={control}
    //   name={`test.${index}.firstName`}
    //   render={({ field }) => (value?.[index]?.checkbox === "on" ? <input {...field} /> : null)}
    // />
  );
};
