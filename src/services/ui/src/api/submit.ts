import { API } from "aws-amplify";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { makoAttachmentSchema, ReactQueryApiError } from "shared-types";
import { z } from "zod";
import { STATES } from "@/consts";
const spaSubmissionAttachment = z.object({
  source: z.instanceof(File),
  label: z.string(),
});
/** Schema for Zod validation */
export const spaSubmissionSchema = z.object({
  // Baseline attributes
  authority: z.string(),
  origin: z.string(),
  submitterEmail: z.string().email(),
  submitterName: z.string(),
  // SPAcific (lol) attributes
  id: z
    .string()
    .regex(
      /^[A-Z]{2}-[0-9]{2}-[0-9]{4}(-[0-9]{4})?$/g,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-xxxx"
    ),
  state: z.string().refine(
    (arg) => STATES.includes(arg),
    (arg) => ({
      message: `${arg} is not a valid state code`,
    })
  ),
  additionalInformation: z.string().max(4000),
  attachments: z
    // Needs to be here as part of the data state's shape
    .array(spaSubmissionAttachment)
    // THIS is the attachment schema we actually send over the wire
    .or(z.array(makoAttachmentSchema)),
  raiResponses: z.array(z.object({})),
  proposedEffectiveDate: z
    .number()
    .refine((arg) => arg > 0, "Please enter a valid date"),
});
export type SpaSubmissionBody = z.infer<typeof spaSubmissionSchema>;
export type Attachment = z.infer<typeof spaSubmissionAttachment>;
/** REST API post call */
export const postSubmissionData = async (
  props: SpaSubmissionBody
): Promise<any> => {
  const results = await API.post("os", "/submit", {
    body: props,
  });
  console.log(results);
  return results;
};
/** React Hook for utilizing the REST API post call */
export const useSubmissionMutation = (
  options?: UseMutationOptions<any, ReactQueryApiError, SpaSubmissionBody>
) => {
  return useMutation<any, ReactQueryApiError, SpaSubmissionBody>(
    (props) => postSubmissionData(props),
    options
  );
};
