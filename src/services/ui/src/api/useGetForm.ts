import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";
import { FormSchema } from "shared-types";
import { reInsertRegex } from "shared-utils";

export const getForm = async (
  formId: string,
  formVersion?: string
): Promise<FormSchema> => {
  const form = await API.post("os", "/forms", {
    body: { formId, formVersion },
  });

  return reInsertRegex(form);
};

export const useGetForm = (formId: string, formVersion?: string) => {
  return useQuery<FormSchema, ReactQueryApiError>([formId, formVersion], () =>
    getForm(formId, formVersion)
  );
};
