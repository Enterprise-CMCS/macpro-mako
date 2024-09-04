import { useQuery } from "@tanstack/react-query";

const fetchPopulationData = async (stateStrings: string) => {
  const response = await fetch(
    `https://api.census.gov/data/2019/pep/population?get=NAME&for=county:*&in=state:${stateStrings}`,
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  //   return data;
  return data.filter((_, index) => index !== 0).map((item) => item[0]);
};

export const usePopulationData = (stateStrings: string) => {
  console.log(stateStrings);
  return useQuery(
    ["populationData", stateStrings],
    () => fetchPopulationData(stateStrings),
    {},
  );
};

export default usePopulationData;
