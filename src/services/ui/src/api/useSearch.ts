import {
  aggQueryBuilder,
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
} from "@/components/Opensearch/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import type {
  ReactQueryApiError,
  OsAggQuery,
  MainFilterable,
  MainDocument,
  OsIndex,
  ChangelogResponse,
  OsQueryState,
  ChangelogField,
  OsResponse,
} from "shared-types";

type QueryProps<T> = {
  index: OsIndex;
  filters: OsQueryState<T>["filters"];
  sort?: OsQueryState<T>["sort"];
  pagination: OsQueryState<T>["pagination"];
  aggs?: OsAggQuery<T>[];
};

export const getOsData = async <TProps, TResponse extends OsResponse<any>>(
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

export const getMainExportData = async (filters?: MainFilterable[]) => {
  if (!filters) return [];

  const recursiveSearch = async (
    startPage: number
  ): Promise<MainDocument[]> => {
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
  return useMutation<TResponse, ReactQueryApiError, QueryProps<TProps>>(
    (props) => getOsData(props),
    options
  );
};

export const useChangelogSearch = (
  options?: UseMutationOptions<
    ChangelogResponse,
    ReactQueryApiError,
    QueryProps<ChangelogField>
  >
) => {
  return useMutation<
    ChangelogResponse,
    ReactQueryApiError,
    QueryProps<ChangelogField>
  >((props) => getOsData(props), options);
};
