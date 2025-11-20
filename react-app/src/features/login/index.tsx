import { AwsCognitoOAuthOpts } from "@aws-amplify/auth/lib-esm/types/Auth";
import { Auth } from "aws-amplify";
import { Link, Navigate } from "react-router";

import config from "@/config";
import { FAQ_TAB } from "@/consts";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { cn } from "@/utils";

const buttonStyling =
  "inline-flex p-2 items-center justify-center rounded-md text-[16px] font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const Login = () => {
  const hideLogin = useFeatureFlag("LOGIN_PAGE");
  const configLogin = () => {
    const authConfig = Auth.configure();
    const { domain, redirectSignIn, responseType } = authConfig.oauth as AwsCognitoOAuthOpts;
    const clientId = authConfig.userPoolWebClientId;
    return `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
  };

  if (hideLogin) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="w-full p-8 font-sans">
      <div className="max-w-[621px] flex flex-col items-center text-center gap-8 mx-auto p-4">
        <h1 className="text-4xl font-serif text-primary-dark">{"Welcome to OneMAC"}</h1>
        <p className="text-lg text-primary-dark">
          OneMAC is the One Medicaid and CHIP System, the system for submitting and reviewing select
          types of state plan amendments (SPAs) and Section 1915 waivers.
        </p>
        <div className="gap-3 flex flex-col items-center">
          <Link
            className={cn("w-60", buttonStyling, "bg-primary text-slate-50 hover:bg-primary-dark")}
            to={configLogin()}
          >
            Log In
          </Link>
          <Link to="/faq" target={FAQ_TAB} className="text-primary underline">
            How do I get access to OneMAC?
          </Link>
        </div>
        <div className="border-gray-300 border-t-2 w-full" />
        <div className="gap-3 flex flex-col items-center">
          <p className="text-lg text-primary-dark font-bold">{"New state users"}</p>
          <Link
            className={cn(
              "w-60",
              buttonStyling,
              "border border-primary text-primary font-bold hover:bg-primary/10",
            )}
            to={config.idm.home_url}
          >
            Register
          </Link>
          <p>
            Learn how with the{" "}
            <Link to="/faq" target={FAQ_TAB} className="text-primary underline">
              IDM for OneMAC User Guide
            </Link>
          </p>
        </div>
        <div className="gap-1 mt-8 flex flex-col items-center text-primary-dark">
          <p className="text-2xl font-bold">Have Questions?</p>
          <p className="font-bold">Contact Help Desk</p>
          <p>
            Email:
            <a className="underline" href="email:OneMAC_Helpdesk@cms.hhs.gov">
              {" "}
              OneMAC_Helpdesk@cms.hhs.gov
            </a>
          </p>
          <p>
            Leave a message at
            <a href="tel:18332282540"> (833) 228-2540</a>
          </p>
        </div>
      </div>
    </div>
  );
};
