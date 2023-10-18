import { API } from "aws-amplify";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ReactQueryApiError } from "shared-types";
import { z } from "zod";
import { STATES } from "@/consts";

/** Schema for Zod validation */
export const submissionApiSchema = z.object({
  id: z
    .string()
    .regex(
      /^[A-Z]{2}-[0-9]{2}-[0-9]{4}(-[0-9]{4})?$/g,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-xxxx"
    ),
  authority: z.string(),
  state: z
    .string()
    .refine((arg) => STATES.includes(arg), "State from ID is invalid"),
  additionalInformation: z.string().max(4000),
  attachments: z.array(z.object({})),
  raiResponses: z.array(z.object({})),
  origin: z.string(),
  submitterEmail: z.string().email(),
  submitterName: z.string(),
  proposedEffectiveDate: z
    .number()
    .refine((arg) => arg > 0, "Please enter a valid date"),
});
export type SubmissionAPIBody = z.infer<typeof submissionApiSchema>;
/** REST API post call */
export const postSubmissionData = async (
  props: SubmissionAPIBody
): Promise<any> => {
  const results = await API.post("os", "/submit", {
    body: props,
  });
  console.log(results);
  return results;
};
/** React Hook for utilizing the REST API post call */
export const useSubmissionMutation = (
  options?: UseMutationOptions<any, ReactQueryApiError, SubmissionAPIBody>
) => {
  return useMutation<any, ReactQueryApiError, SubmissionAPIBody>(
    (props) => postSubmissionData(props),
    options
  );
};
