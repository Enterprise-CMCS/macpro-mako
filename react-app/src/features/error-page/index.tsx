import { Link } from "react-router";

import { BreadCrumbs, SimplePageContainer } from "@/components";

export const ErrorPage = () => {
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
            displayText: "Error Page",
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
            <Link className="text-2xl p-0 text-primary hover:underline font-bold" to="/support">
              Get Support
            </Link>
          </div>
        </div>
      </main>
    </SimplePageContainer>
  );
};
