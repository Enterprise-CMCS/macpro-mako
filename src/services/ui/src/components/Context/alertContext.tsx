import { PropsWithChildren, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { createContextProvider } from "@/utils";
import { Alert, SimplePageContainer, Route, AlertVariant } from "@/components";
import { useLocation } from "react-router-dom";

type BannerContent = {
  header: string;
  body: string;
};

const useAlertController = () => {
  const [bannerShow, setBannerShow] = useState<boolean>(false);
  const [bannerStyle, setBannerStyle] = useState<AlertVariant>("success");
  const [bannerDisplayOn, setBannerDisplayOn] = useState<Route>("/");
  const [content, setContent] = useState<BannerContent>({
    header: "No header given",
    body: "No body given",
  });
  return {
    content,
    setContent,
    bannerStyle,
    setBannerStyle,
    bannerDisplayOn,
    setBannerDisplayOn,
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
  const location = useLocation();
  /* When a form redirects on success, these two values will match.
   * Once a user navigates away from that path, we set the show boolean
   * to false, so we ensure it won't show again if they navigate back to
   * the Route defined in context.bannerDisplayOn */
  useEffect(() => {
    if (context.bannerDisplayOn !== location.pathname)
      context.setBannerShow(false);
  }, [location.pathname]);
  return (
    <AlertContextProvider value={context}>
      {/* Relies on the effect above to swap context.bannerShow boolean on
       * Route change*/}
      {context.bannerDisplayOn === location.pathname && context.bannerShow && (
        <SimplePageContainer>
          <Alert
            variant={context.bannerStyle}
            className="mt-4 mb-8 flex-row text-sm"
          >
            <div className={"flex items-start justify-between"}>
              <Check />
              <div className={"ml-2 w-full"}>
                <h3 className={"text-lg font-bold"}>
                  {context.content.header}
                </h3>
                <p>{context.content.body}</p>
              </div>
              <button onClick={() => context.setBannerShow(false)}>
                <X size={20} />
              </button>
            </div>
          </Alert>
        </SimplePageContainer>
      )}
      {children}
    </AlertContextProvider>
  );
};
