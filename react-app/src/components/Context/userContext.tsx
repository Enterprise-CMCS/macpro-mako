import { OneMacUser, useGetUser } from "@/api";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { getUserStateCodes } from "@/utils";
import { usePopulationData } from "@/api";
import { FULL_CENSUS_STATES } from "shared-types";

const initialState = { user: null, counties: [] };

export const UserContext = createContext<OneMacUser | undefined>(initialState);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { data: userData, error: userError } = useGetUser();

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

  const { data: populationData, error: populationError } = usePopulationData(
    stateNumericCodesString,
  );

  const counties = useMemo(
    () =>
      populationData?.map((county) => {
        const [label] = county.split(",");
        return { label, value: county };
      }) ?? [],
    [populationData],
  );

  const contextValue = useMemo(
    () => ({
      user: userData?.user ?? null,
      isCms: userData?.isCms,
      counties,
    }),
    [userData, counties],
  );

  if (userError || populationError) {
    console.error("Error fetching data:", userError || populationError);
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
