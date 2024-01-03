import { getOsData, useOsSearch } from "@/api";
import { useLzUrl } from "@/hooks/useParams";
import { useEffect, useState } from "react";
import {
  ChangelogField,
  ChangelogResponse,
  //   UserRoles,
  ChangelogState,
} from "shared-types";
import { createSearchFilterable } from "../utils";
// import { useQuery } from "@tanstack/react-query";
// import { useGetUser } from "@/api/useGetUser";

export const useOsChangelog = () => {
  const [data, setData] = useState<ChangelogResponse["hits"]>();
  const { mutateAsync, isLoading, error } = useOsSearch<
    ChangelogField,
    ChangelogResponse
  >({});

  useEffect(() => {
    (async () => {
      try {
        await mutateAsync(
          {
            index: "changelog",
            pagination: { number: 0, size: 200 },
            filters: [
              {
                field: "packageId.keyword",
                value: "",
                prefix: "must",
                type: "term",
              },
            ],
          },
          { onSuccess: (res) => setData(res.hits) }
        );
      } catch (error) {
        console.error("Error occurred during search:", error);
      }
    })();
  }, []);

  return { data, isLoading, error };
};
