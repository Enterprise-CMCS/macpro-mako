/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  aggQueryBuilder,
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
} from "@/components/Opensearch/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import type { ReactQueryApiError, opensearch } from "shared-types";

type QueryProps<T> = {
  index: opensearch.Index;
  filters: opensearch.QueryState<T>["filters"];
  sort?: opensearch.QueryState<T>["sort"];
  pagination: opensearch.QueryState<T>["pagination"];
  aggs?: opensearch.AggQuery<T>[];
};

export const getOsData = async <
  TProps,
  TResponse extends opensearch.Response<any>
>(
  props: QueryProps<TProps>
): Promise<TResponse> => {
  const searchData = await API.post("os", `/search/${props.index}`, {
    body: {
      ...filterQueryBuilder(props.filters),
      ...paginationQueryBuilder(props.pagination),
      ...(!!props.sort && sortQueryBuilder(props.sort)),
      ...(!!props.aggs && aggQueryBuilder(props.aggs)),
      track_total_hits: true,
    },
  });

  return searchData;
};

export const getMainExportData = async (
  filters?: opensearch.main.Filterable[]
) => {
  if (!filters) return [];

  const recursiveSearch = async (
    startPage: number
  ): Promise<opensearch.main.Document[]> => {
    if (startPage * 1000 >= 10000) {
      return [];
    }

    const searchData = await API.post("os", "/search/main", {
      body: {
        ...filterQueryBuilder(filters),
        ...paginationQueryBuilder({ number: startPage, size: 1000 }),
      },
    });

    if (searchData?.hits.hits.length < 1000) {
      return searchData.hits.hits.map((hit: any) => ({ ...hit._source })) || [];
    }

    return searchData.hits.hits
      .map((hit: any) => ({
        ...hit._source,
      }))
      .concat(await recursiveSearch(startPage + 1));
  };

  return await recursiveSearch(0);
};

export const useOsSearch = <TProps, TResponse>(
  options?: UseMutationOptions<
    TResponse,
    ReactQueryApiError,
    QueryProps<TProps>
  >
) => {
  //@ts-ignore
  return useMutation<TResponse, ReactQueryApiError, QueryProps<TProps>>(
    (props) => getOsData(props),
    options
  );
};

export const useChangelogSearch = (
  options?: UseMutationOptions<
    opensearch.changelog.Response,
    ReactQueryApiError,
    QueryProps<opensearch.changelog.Field>
  >
) => {
  return useMutation<
    opensearch.changelog.Response,
    ReactQueryApiError,
    QueryProps<opensearch.changelog.Field>
  >((props) => getOsData(props), options);
};
