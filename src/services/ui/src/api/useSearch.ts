import { useQuery, UseQueryOptions } from "@tanstack/react-query";
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
  const SearchData = await API.post("seatool", `/search/${selectedState}`, {
    body: { searchString },
  });

  return SearchData;
};

export const useSearch = (
  props: { selectedState: string; searchbox: string },
  options?: UseQueryOptions<{ hits: SearchData[] }, ReactQueryApiError>
) => {
  console.log({ props });
  return useQuery<{ hits: SearchData[] }, ReactQueryApiError>(
    ["seatool", props.selectedState],
    {
      queryFn: () => getSearchData(props.selectedState, props.searchbox),
      ...options,
    }
  );
};
