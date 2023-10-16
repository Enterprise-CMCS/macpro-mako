import { API } from "aws-amplify";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { MakoTransform, ReactQueryApiError } from "shared-types";

export type SubmissionAPIBody = MakoTransform & {
  authority: number;
  state: string;
};
export const postSubmissionData = async (
  props: SubmissionAPIBody
): Promise<any> => {
  const results = await API.post("os", "/submit", {
    body: props,
  });
  console.log(results);
  return results;
};

export const useSubmissionMutation = (
  options?: UseMutationOptions<any, ReactQueryApiError, SubmissionAPIBody>
) => {
  return useMutation<any, ReactQueryApiError, SubmissionAPIBody>(
    (props) => postSubmissionData(props),
    options
  );
};
