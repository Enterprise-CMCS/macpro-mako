import {
  aggQueryBuilder,
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
} from "@/components/Opensearch/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError, SearchData } from "shared-types";
import type {
  OsQueryState,
  OsFilterable,
  OsAggQuery,
  OsMainSearchResponse,
} from "shared-types";

type QueryProps = {
  filters: OsQueryState["filters"];
  sort?: OsQueryState["sort"];
  pagination: OsQueryState["pagination"];
  aggs?: OsAggQuery[];
};

export const getSearchData = async (
  props: QueryProps
): Promise<OsMainSearchResponse> => {
  const searchData = await API.post("os", "/search", {
    body: {
      ...filterQueryBuilder(props.filters),
      ...paginationQueryBuilder(props.pagination),
      ...(!!props.sort && sortQueryBuilder(props.sort)),
      ...(!!props.aggs && aggQueryBuilder(props.aggs)),
    },
  });

  return searchData;
};

export const getAllSearchData = async (filters?: OsFilterable[]) => {
  if (!filters) return;
  let gettingData = true;
  let page = 0;
  const SIZE = 1000;

  const allHits: SearchData["hits"][] = [];

  while (gettingData && page * SIZE < 10000) {
    const searchData = (await API.post("os", "/search", {
      body: {
        ...filterQueryBuilder(filters),
        ...paginationQueryBuilder({
          number: page,
          size: 1000,
        }),
      },
    })) as OsMainSearchResponse;

    if (searchData?.hits.hits.length === 0) {
      gettingData = false;
    } else {
      allHits.push([...searchData.hits.hits]);
      page++;
    }
  }

  return allHits.flat();
};

export const useOsSearch = (
  options?: UseMutationOptions<
    OsMainSearchResponse,
    ReactQueryApiError,
    QueryProps
  >
) => {
  return useMutation<OsMainSearchResponse, ReactQueryApiError, QueryProps>(
    (props) => getSearchData(props),
    options
  );
};
