import { AwsCognitoOAuthOpts } from "@aws-amplify/auth/lib-esm/types/Auth";
import { Auth } from "aws-amplify";

import { Button } from "@/components";
import config from "@/config";

export const Login = () => {
  const handleLogin = () => {
    const authConfig = Auth.configure();
    const { domain, redirectSignIn, responseType } = authConfig.oauth as AwsCognitoOAuthOpts;
    const clientId = authConfig.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
    window.location.assign(url);
  };

  const handleRegister = () => {
    const url = `${config.idm.home_url}/signin/login.html`;
    window.location.assign(url);
  };

  return (
    <div className="w-full p-8 font-sans">
      <div className="max-w-[621px] flex flex-col items-center text-center gap-8 mx-auto p-4">
        <h1 className="text-4xl font-serif text-primary-dark">{"Welcome to OneMAC"}</h1>
        <p className="text-lg text-primary-dark">
          {
            "OneMAC is the One Medicaid and CHIP System, the system for submitting and reviewing select types of state plan amendments (SPAs) and Section 1915 waivers."
          }
        </p>
        <div className="gap-3 flex flex-col items-center">
          <Button className="w-60" onClick={handleLogin}>
            {"Log in"}
          </Button>
          <a href="/test" className="text-primary underline">
            {"How do I get access to OneMAC?"}
          </a>
        </div>
        <div className="border-gray-300 border-y-2 w-full" />
        <div className="gap-3 flex flex-col items-center">
          <p className="text-lg text-primary-dark font-bold">{"New state users"}</p>
          <Button variant="outline" className="w-60" onClick={handleRegister}>
            {"Register"}
          </Button>
          <p>
            {"Learn how with the "}{" "}
            <a className="text-primary underline">{"IDM for OneMAC User Guide"}</a>
          </p>
        </div>
        <div className="gap-1 mt-8 flex flex-col items-center text-primary-dark">
          <p className="text-2xl font-bold">{"Have Questions?"}</p>
          <p className="font-bold">{"Contact Help Desk"}</p>
          <p>
            {"Email: "}
            <a href="email:OneMAC_Helpdesk@cms.hhs.gov">{"OneMAC_Helpdesk@cms.hhs.gov"}</a>
          </p>
          <p>
            {"Leave a message at "}
            <a href="tel:18332282540">{"(833) 228-2540"}</a>
          </p>
        </div>
      </div>
    </div>
  );
};
