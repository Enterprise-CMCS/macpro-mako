import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import cmsLogo from "@enterprise-cmcs/macpro-ux-lib/build/assets/img/logos/cms_logo.svg";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import { AwsCognitoOAuthOpts } from "@aws-amplify/auth/lib-esm/types";
import { getLoaderInfo } from "../../router";

function handleLogin() {
  const authConfig = Auth.configure();
  const { domain, redirectSignIn, responseType } =
    authConfig.oauth as AwsCognitoOAuthOpts;
  const clientId = authConfig.userPoolWebClientId;
  const url = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
  window.location.assign(url);
}

export default function MainWrapper() {
  const { user } = useLoaderData() as Awaited<ReturnType<typeof getLoaderInfo>>;
  const navigate = useNavigate();

  async function handleLogout() {
    await Auth.signOut();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <UI.UsaBanner locale="en" />
      <UI.Header
        headerLogo={
          <UI.Link href="" title="Project Title">
            <UI.Logo altText="Project Logo" source={cmsLogo} />
          </UI.Link>
        }
        navData={[
          {
            buttonText: "Home",
            columns: [
              [
                {
                  href: "/",
                  text: "Home Page",
                },
              ],
            ],
          },
          {
            buttonText: "Issues",
            columns: [
              [
                {
                  href: "/issues",
                  text: "All Issues",
                },
              ],
            ],
          },
          {
            buttonText: "Packages",
            columns: [
              [
                {
                  text: "Medicaid",
                  onClick: () => {
                    navigate("/medicaid");
                  },
                },
                {
                  text: "Chip",
                  onClick: () => {
                    navigate("/chip");
                  },
                },
                {
                  text: "Waivers",
                  onClick: () => {
                    navigate("/waiver");
                  },
                },
              ],
            ],
          },
        ]}
        secondaryComponent={
          <>
            {user ? (
              <UI.ActionsMenu
                links={[
                  {
                    href: "",
                    iconName: "person",
                    target: "_blank",
                    text: "Manage Profile",
                  },
                  {
                    href: "",
                    iconName: "people",
                    target: "_blank",
                    text: "Request Role Change",
                  },
                  {
                    href: "#",
                    iconName: "logout",
                    onClick: handleLogout,
                    text: "Log Out",
                  },
                ]}
                name="My Account"
              />
            ) : (
              <UI.ActionsMenu
                links={[
                  {
                    href: "#",
                    iconName: "login",
                    onClick: handleLogin,
                    text: "Login with IDM",
                  },
                ]}
                name="Login"
              />
            )}
          </>
        }
      />
      <main className="padding-x-5" style={{ flex: 1 }}>
        <div className="max-w-screen-lg mx-auto px-8 pt-2">
          {user ? (
            <UI.Typography size="2xs">Hi {user.given_name}</UI.Typography>
          ) : null}
          <Outlet />
        </div>
      </main>
      <UI.Footer style={{ marginTop: "auto" }} emailAddress="QPP@cms.hhs.gov" />
    </div>
  );
}
