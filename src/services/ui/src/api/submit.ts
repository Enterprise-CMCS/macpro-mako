import { API } from "aws-amplify";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ReactQueryApiError } from "shared-types";

export type FormData = {
  id: string;
  authority: string;
  state: string;
};

export const getSubmissionData = async (props: FormData): Promise<any> => {
  const results = await API.post("os", "/submit", {
    body: props,
  });
  console.log(results);
  return results;
};

export const useCreateSeatoolRecord = (
  options?: UseMutationOptions<any, ReactQueryApiError, FormData>
) => {
  return useMutation<any, ReactQueryApiError, FormData>(
    (props) => getSubmissionData(props),
    options
  );
};
