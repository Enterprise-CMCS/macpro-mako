import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { OsHit, OsMainSourceItem, ReactQueryApiError } from "shared-types";

export const getForm = async (id: string): Promise<OsHit<OsMainSourceItem>> => {
  const form = await API.post("os", "/forms", { body: { id } });

  console.info("form", form);

  return form;
};

export const useGetForm = (id: string) => {
  return useQuery<OsHit<OsMainSourceItem>, ReactQueryApiError>(
    ["formID", id],
    () => getForm(id)
  );
};
