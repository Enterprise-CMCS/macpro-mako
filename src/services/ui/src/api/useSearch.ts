import {
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
} from "@/components/Opensearch/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError, SearchData } from "shared-types";
import type { OsQueryState } from "shared-types";

type QueryProps = {
  filters: OsQueryState["filters"];
  sort?: OsQueryState["sort"];
  pagination: OsQueryState["pagination"];
};

export const getSearchData = async (props: QueryProps): Promise<SearchData> => {
  const searchData = await API.post("os", "/search", {
    body: {
      ...filterQueryBuilder(props.filters),
      ...paginationQueryBuilder(props.pagination),
      ...(!!props.sort && sortQueryBuilder(props.sort)),
    },
  });

  return searchData;
};

export const useOsSearch = (
  options?: UseMutationOptions<SearchData, ReactQueryApiError, QueryProps>
) => {
  return useMutation<SearchData, ReactQueryApiError, QueryProps>(
    (props) => getSearchData(props),
    options
  );
};
