import { OneMacUser, useGetUser } from "@/api";
import { PropsWithChildren, createContext, useContext } from "react";
import { getUserStateCodes } from "@/utils";
import { usePopulationData } from "@/api";
import { FULL_STATES } from "shared-types";

const initialState = { user: null };

export const UserContext = createContext<OneMacUser | undefined>(initialState);
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { data: userData } = useGetUser();
  const stateCodes = getUserStateCodes(userData?.user);

  const stateNumericCodesString = stateCodes
    .map((code) => {
      return FULL_STATES.find((state) => state.value === code)?.code;
    })
    .filter((code) => code !== "00")
    ?.join();

  const { data: populationData } = usePopulationData(stateNumericCodesString);

  const objectOfCounties = populationData?.map((county) => {
    return { label: county.split(",")[0], value: county };
  });

  if (userData?.user && populationData) {
    userData.user.counties = objectOfCounties;
  }

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
