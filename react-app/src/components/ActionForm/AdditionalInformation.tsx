import { ControllerRenderProps, FieldPath } from "react-hook-form";
import { z } from "zod";
import {useState} from "react";

import { FormDescription, FormItem, FormLabel, Textarea } from "../Inputs";
import { SchemaWithEnforcableProps } from ".";

type AdditionalInformationProps<Schema extends SchemaWithEnforcableProps> = {
  label: string;
  field: ControllerRenderProps<z.TypeOf<Schema>, FieldPath<z.TypeOf<Schema>>>;
  submissionType: string
};


export const AdditionalInformation = <Schema extends SchemaWithEnforcableProps>({
  label,
  field,
  submissionType
}: AdditionalInformationProps<Schema>) => {
const [inputValue, setInputValue] =  useState("");
const handleInputChange = (event)=> {
  // if (inputValue == "" && event.target.value.length > 1) {
  //   console.log("user has typed into additional information box, submissionType: ", submissionType);
  //   window.gtag("event", "submit_additional_info_used", {submission_type: submissionType})
  // }
  // setInputValue(event.target.value);
  // field.onChange(event);
  console.log("additional information typed")
};
return(
  <FormItem>
    <FormLabel htmlFor="additional-info" data-testid="addl-info-label" className="font-normal">
      {label}
    </FormLabel>
    <Textarea
      {...field}
      maxLength={4000}
      aria-describedby="character-count"
      aria-live="off"
      aria-multiline={true}
      className="h-[200px] resize-none"
      id="additional-info"
      onChange={handleInputChange}
    />
    <FormDescription>
      <span
        tabIndex={0}
        id="character-count"
        aria-label="character-count"
        aria-live="polite"
        className="text-neutral-500"
      >
        {`${4000 - (field?.value?.length || 0)} characters remaining`}
      </span>
    </FormDescription>
  </FormItem>
)
};
