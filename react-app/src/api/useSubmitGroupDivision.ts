import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";

type GroupDivisionParams = {
  group: string;
  division: string;
};

export const submitGroupDivision = async (
  params: GroupDivisionParams,
): Promise<{ message: string }> => {
  try {
    console.log(params, "PARAMS");
    const submitGroupAndDivisionInfo = await API.post("os", "/submitGroupDivision", {
      body: params,
    });
    return submitGroupAndDivisionInfo;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to submit group and division: ", error);
  }
};

export const useSubmitGroupDivision = () => {
  return useMutation<{ message: string }, Error, GroupDivisionParams>({
    mutationFn: (params) => submitGroupDivision(params),
  });
};
