import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError, SearchData } from "shared-types";

export const getSearchData = async (
  searchString: string,
  authority: string
): Promise<SearchData> => {
  const query: any = {
    from: 0,
    size: 10000,
    query: {
      bool: {
        must: [
          {
            match: {
              authority: {
                query: authority,
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
        match_phrase: {
          id: `${searchString}`,
        },
      },
      {
        fuzzy: {
          submitterName: {
            value: `${searchString}`,
          },
        },
      },
      {
        fuzzy: {
          leadAnalyst: {
            value: `${searchString}`,
          },
        },
      },
    ];
  } else {
    // If we haven't specified any parameters, lets just sort by changed date
    query.sort = [
      {
        changedDate: {
          order: "desc",
        },
      },
    ];
  }
  const searchData = await API.post("os", "/search", {
    body: query,
  });

  return searchData;
};

export const useSearch = (
  options?: UseMutationOptions<
    SearchData,
    ReactQueryApiError,
    { searchString: string; authority: string }
  >
) => {
  return useMutation<
    SearchData,
    ReactQueryApiError,
    { searchString: string; authority: string }
  >((props) => getSearchData(props.searchString, props.authority), options);
};
