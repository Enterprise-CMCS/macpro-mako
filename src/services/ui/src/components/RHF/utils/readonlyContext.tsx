import { PropsWithChildren, createContext, useContext } from "react";

interface ReadOnlyContextType {
  readonly: boolean;
}

export const ReadOnlyContext = createContext<ReadOnlyContextType>({
  readonly: false,
});

export const useReadOnlyContext = () => useContext(ReadOnlyContext);

export const ReadOnlyContextProvider = ({
  children,
  ...props
}: PropsWithChildren<ReadOnlyContextType>) => {
  return (
    <ReadOnlyContext.Provider value={props}>
      {children}
    </ReadOnlyContext.Provider>
  );
};
