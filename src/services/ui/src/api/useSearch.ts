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
  searchString: string,
  programType: string
): Promise<{ hits: SearchData[] }> => {
  const query: any = {
    from: 0,
    size: 100,
    query: {
      bool: {
        must: [
          {
            match: {
              programType: {
                query: programType,
              },
            },
          },
        ],
      },
    },
  };
  if (searchString) {
    query.query.bool.should = [
      {
        match: {
          _id: {
            query: searchString,
            boost: 5,
          },
        },
      },
      {
        match: {
          "seatool.STATE_PLAN.ID_NUMBER": {
            query: searchString,
            fuzziness: "AUTO",
          },
        },
      },
    ];
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
    { selectedState: string; searchString: string; programType: string }
  >
) => {
  return useMutation<
    { hits: SearchData[] },
    ReactQueryApiError,
    { selectedState: string; searchString: string; programType: string }
  >(
    (props) =>
      getSearchData(props.selectedState, props.searchString, props.programType),
    options
  );
};
