import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";

export const getForm = async (
  formId: string,
  formVersion?: string
): Promise<any> => {
  const form = await API.get("os", "/forms", {
    queryStringParameters: { formId, formVersion },
  });

  return form;
};

export const useGetForm = (formId: string, formVersion?: string) => {
  return useQuery<any, ReactQueryApiError>(["formID"], () =>
    getForm(formId, formVersion)
  );
};
