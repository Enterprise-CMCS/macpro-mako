import { ControllerRenderProps, FieldPath } from "react-hook-form";
import { z } from "zod";
import {useState} from "react";
import {mapSubmissionTypeBasedOnActionFormTitle} from "../../utils/ReactGA/Mapper";
import { sendGAEvent } from "../../utils/ReactGA/SendGAEvent";

import { FormDescription, FormItem, FormLabel, Textarea } from "../Inputs";
import { SchemaWithEnforcableProps } from ".";

type AdditionalInformationProps<Schema extends SchemaWithEnforcableProps> = {
  label: string;
  field: ControllerRenderProps<z.TypeOf<Schema>, FieldPath<z.TypeOf<Schema>>>;
  submissionTitle: string
};


export const AdditionalInformation = <Schema extends SchemaWithEnforcableProps>({
  label,
  field,
  submissionTitle
}: AdditionalInformationProps<Schema>) => {
const [inputValue, setInputValue] =  useState("");
const handleInputChange = (event)=> {
  if (event.target.value.length == 1) {
    const mappedSubmissionType = mapSubmissionTypeBasedOnActionFormTitle(submissionTitle);
    sendGAEvent("submit_additional_info_used", {submission_type: mappedSubmissionType})
  }
  setInputValue(event.target.value);
  field.onChange(event);
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
