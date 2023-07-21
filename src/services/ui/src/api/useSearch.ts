import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";

export type SearchData = {
  _index: string;
  _id: string;
  _score: number;
  _source: any;
};

export const getSearchData = async (
  selectedState: string,
  searchString: string
): Promise<{ hits: SearchData[] }> => {
  let query = {};
  if (searchString) {
    query = {
      query: {
        bool: {
          should: [
            {
              match: {
                "seatool.STATE_PLAN.SUMMARY_MEMO": searchString,
              },
            },
          ],
        },
      },
    };
  }
  const searchData = await API.post("seatool", `/search/${selectedState}`, {
    body: query,
  });

  return searchData;
};

export const useSearch = (
  options?: UseMutationOptions<
    { hits: SearchData[] },
    ReactQueryApiError,
    { selectedState: string; searchString: string }
  >
) => {
  return useMutation<
    { hits: SearchData[] },
    ReactQueryApiError,
    { selectedState: string; searchString: string }
  >((props) => getSearchData(props.selectedState, props.searchString), options);
};
