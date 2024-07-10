import { OneMacUser, useGetUser } from "@/api";
import { PropsWithChildren, createContext, useContext } from "react";

const initialState = { user: null };

export const UserContext = createContext<OneMacUser | undefined>(initialState);
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { data: userData } = useGetUser();
  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
