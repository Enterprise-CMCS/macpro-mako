import { useEffect, useState } from "react";
import { Link } from "react-router";

import { BreadCrumbs, SimplePageContainer } from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
import { Button, Input } from "../../components/Inputs";
import { API } from "aws-amplify";
export const ErrorPage = () => {
  const isFAQEnabled = useFeatureFlag("TOGGLE_FAQ");
  useEffect(() => {
    sendGAEvent("error_404", { message: "404 page not found" });
  }, []);

  const [inputValue, setInputValue] = useState("")

  const handleInputChange = (e)=> {
    console.log("input value: ", e.target.value)
    setInputValue(e.target.value)
  }
  const handleButtonClick = async() => {
    const response = await API.post("os", "/softDeletePackage", {
      body: { id: inputValue },
    });

    console.log("response: ", response);
  }

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={[
          {
            to: "/",
            displayText: "Home",
            order: 0,
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

          <Input
            onChange={handleInputChange}
          />
          <Button
           onClick={handleButtonClick}
          />


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
