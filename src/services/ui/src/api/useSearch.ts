import { Filterable, QueryState } from "@/components/Opensearch/types";
import {
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
} from "@/components/Opensearch/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError, SearchData } from "shared-types";

type QueryProps = {
  filters: Filterable[];
  sort: QueryState["sort"];
  pagination: QueryState["pagination"];
};

export const getSearchData = async (props: QueryProps): Promise<SearchData> => {
  const query = {
    ...filterQueryBuilder(props.filters),
    ...paginationQueryBuilder(props.pagination),
    ...sortQueryBuilder(props.sort),
  };
  const searchData = await API.post("os", "/search", {
    body: query,
  });

  return searchData;
};

export const useSearch = (
  options?: UseMutationOptions<SearchData, ReactQueryApiError, QueryProps>
) => {
  return useMutation<SearchData, ReactQueryApiError, QueryProps>(
    (props) => getSearchData(props),
    options
  );
};
