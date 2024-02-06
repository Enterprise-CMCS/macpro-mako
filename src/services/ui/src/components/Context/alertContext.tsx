import { PropsWithChildren, useState } from "react";
import { Check } from "lucide-react";
import { createContextProvider } from "@/utils";
import { Alert, SimplePageContainer } from "@/components";

type BannerContent = {
  header: string;
  body: string;
};

const useAlertController = () => {
  const [bannerShow, setBannerShow] = useState<boolean>(false);
  const [content, setContent] = useState<BannerContent>({
    header: "No header given",
    body: "No body given",
  });
  return {
    content,
    setContent,
    bannerShow,
    setBannerShow,
  };
};

export const [AlertContextProvider, useAlertContext] = createContextProvider<
  ReturnType<typeof useAlertController>
>({
  name: "Banner Context",
  errorMessage:
    "This component requires the `AlertProvider` wrapper to make use of banner UIs.",
});

export const AlertProvider = ({ children }: PropsWithChildren) => {
  const context = useAlertController();
  return (
    <AlertContextProvider value={context}>
      {context.bannerShow && (
        <SimplePageContainer>
          <Alert variant={"success"} className="mt-4 mb-8 flex-row text-sm">
            <Check />
            <div className={"ml-2"}>
              <h3 className={"text-lg font-bold"}>{context.content.header}</h3>
              <p>{context.content.body}</p>
            </div>
          </Alert>
        </SimplePageContainer>
      )}
      {children}
    </AlertContextProvider>
  );
};
