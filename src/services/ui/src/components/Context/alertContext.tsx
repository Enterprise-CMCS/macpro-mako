import { PropsWithChildren, useState } from "react";
import { Info } from "lucide-react";
import { createContextProvider } from "@/utils";
import { Alert } from "@/components";

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
      <Alert variant={"infoBlock"} className="my-2 w-full flex-row text-sm">
        <Info />
        <p className="ml-2">
          Once you submit this form, a confirmation email is sent to you and to
          the State.
        </p>
      </Alert>
      {children}
    </AlertContextProvider>
  );
};
