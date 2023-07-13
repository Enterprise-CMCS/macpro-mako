import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";

type SearchData = {
  _index: string;
  _id: string;
  _score: number;
  _source: any;
};

export const getSearchData = async (
  selectedState: string
): Promise<{ hits: SearchData[] }> => {
  const SearchData = await API.get("seatool", `/search/${selectedState}`, {});

  return SearchData;
};

export const useSearch = (
  props: { selectedState: string; searchbox: string },
  options?: UseQueryOptions<{ hits: SearchData[] }, ReactQueryApiError>
) =>
  useQuery<{ hits: SearchData[] }, ReactQueryApiError>(
    ["seatool", props.selectedState],
    {
      queryFn: () => getSearchData(props.selectedState),
      ...options,
    }
  );
