import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import cmsLogo from "@enterprise-cmcs/macpro-ux-lib/build/assets/img/logos/cms_logo.svg";
import { Outlet, useLoaderData } from "react-router-dom";
import { Auth } from "aws-amplify";

export default function MainWrapper() {
  const { isAuth } = useLoaderData() as { isAuth: true };

  async function handleLogin() {
    const authConfig = Auth.configure();
    const { domain, redirectSignIn, responseType } = authConfig.oauth as any;
    const clientId = authConfig.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
    window.location.assign(url);
  }

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
        ]}
        secondaryComponent={
          <>
            {isAuth ? (
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
        <Outlet />
      </main>
      <UI.Footer style={{ marginTop: "auto" }} emailAddress="QPP@cms.hhs.gov" />
    </div>
  );
}
