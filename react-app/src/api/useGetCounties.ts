import { useQuery } from "@tanstack/react-query";

const fetchPopulationData = async (stateString: string) => {
  if (stateString) {
    const response = await fetch(
      `https://api.census.gov/data/2019/pep/population?get=NAME&for=county:*&in=state:${stateString}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch population data");
    }

    const data = await response.json();
    return data.slice(1).map((item) => item[0]);
  }
  return [];
};

export const usePopulationData = (stateString: string) => {
  return useQuery(
    ["populationData", stateString],
    () => fetchPopulationData(stateString),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );
};

export default usePopulationData;
