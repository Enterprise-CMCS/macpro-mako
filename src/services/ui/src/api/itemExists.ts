import { API } from "aws-amplify";
import { opensearch } from "shared-types";

export const itemExists = async (
  id: string
): Promise<opensearch.main.ItemResult> => {
  return (await API.post("os", "/itemExists", { body: { id } })).body?.exists;
};
