import { useQuery } from "@tanstack/react-query";
import { useGetUser } from "./useGetUser";
import { getUserStateCodes } from "@/utils";
import { FULL_CENSUS_STATES } from "shared-types";
import { useMemo } from "react";

const usePopulationData = (stateString: string) => {
  return useQuery(
    ["populationData", stateString],
    () =>
      fetch(
        `https://api.census.gov/data/2019/pep/population?get=NAME&for=county:*&in=state:${stateString}`,
      )
        .then((response) => response.json())
        .then((population) => population.slice(1).map((item) => item[0])),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );
};

export const useGetCounties = (): { label: string; value: string }[] => {
  const { data: userData } = useGetUser();

  const stateCodes = useMemo(
    () => getUserStateCodes(userData?.user),
    [userData],
  );

  const stateNumericCodesString = useMemo(
    () =>
      stateCodes
        .map(
          (code) =>
            FULL_CENSUS_STATES.find((state) => state.value === code)?.code,
        )
        .filter((code): code is string => code !== undefined && code !== "00")
        .join(","),
    [stateCodes],
  );

  const { data: populationData = [] } = usePopulationData(
    stateNumericCodesString,
  );

  return (
    populationData.map((county) => {
      const [label] = county.split(",");
      return { label, value: county };
    }) ?? []
  );
};
