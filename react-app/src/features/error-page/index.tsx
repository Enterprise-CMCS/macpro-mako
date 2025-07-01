import { useEffect } from "react";
import { Link } from "react-router";

import { BreadCrumbs, SimplePageContainer } from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const ErrorPage = () => {
  const isFAQEnabled = useFeatureFlag("TOGGLE_FAQ");
  useEffect(()=>{
    sendGAEvent("error", {message: "404 page not found"});
   },[]);
  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={[
          {
            to: "/",
            displayText: "Home",
            order: 0,
            default: true,
          },
          {
            to: "/404",
            displayText: "Page not found",
            order: 1,
          },
        ]}
      />
      <main className="flex justify-center flex-col items-center gap-y-10">
        <div>
          <h1 className="text-5xl font-[Merriweather] font-bold">
            Sorry, we couldn't find that page.
          </h1>

          <div className="pt-10 flex gap-x-20">
            <Link className="text-2xl p-0 text-primary hover:underline font-bold" to="/">
              Go to Home Page
            </Link>
            <Link
              className="text-2xl p-0 text-primary hover:underline font-bold"
              to={isFAQEnabled ? "/support" : "/faq"}
            >
              Get Support
            </Link>
          </div>
        </div>
      </main>
    </SimplePageContainer>
  );
};
