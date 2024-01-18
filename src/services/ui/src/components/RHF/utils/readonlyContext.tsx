import { PropsWithChildren, createContext, useContext } from "react";

interface ReadOnlyContextType {
  readonly: boolean;
}

export const ReadOnlyContext = createContext<ReadOnlyContextType>({
  readonly: false,
});

export const useReadOnlyContext = () => useContext(ReadOnlyContext);

export const ReadOnlyProvider = ({
  children,
  ...props
}: PropsWithChildren<ReadOnlyContextType>) => {
  return (
    <ReadOnlyContext.Provider value={props}>
      <fieldset disabled={!!props.readonly}>{children}</fieldset>
    </ReadOnlyContext.Provider>
  );
};
