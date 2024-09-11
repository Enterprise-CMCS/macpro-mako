import { useQuery } from "@tanstack/react-query";

const fetchPopulationData = async (stateString: string) => {
  try {
    if (stateString) {
      const response = await fetch(
        `https://api.census.gov/data/2019/pep/population?get=NAME&for=county:*&in=state:${stateString}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch county data");
      }

      const data = await response.json();
      return data.slice(1).map((item) => item[0]);
    }
    return [];
  } catch (error) {
    console.error("Error fetching county data:", error);
    throw error;
  }
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
