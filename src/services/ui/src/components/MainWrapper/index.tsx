import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import cmsLogo from "@enterprise-cmcs/macpro-ux-lib/build/assets/img/logos/cms_logo.svg";
import { Outlet, useLoaderData } from "react-router-dom";
import { Auth } from 'aws-amplify';

export default function MainWrapper() {
  const albums = useLoaderData() as any;

  async function handleLogin(event: any) {
    event.preventDefault();
    try {
      const authConfig = Auth.configure();
      const { domain, redirectSignIn, responseType } = authConfig.oauth as any;
      const clientId = authConfig.userPoolWebClientId;
      const url = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
      window.location.assign(url);
    } catch (e) {
      throw (e);
    }
  }

  async function handleLogout(event: any) {
    event.preventDefault();
    await Auth.signOut();

    // history.push("/");
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
            {albums.spiderman ?
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
                    href: "",
                    iconName: "logout",
                    ///@ts-ignore
                    onClick: (e) => handleLogout(e),
                    text: "Log Out",
                  },
                ]}
                name="My Account"
              /> : <UI.ActionsMenu
                links={[
                  {
                    href: "",
                    iconName: "login",
                    ///@ts-ignore
                    onClick: (e) => handleLogin(e),
                    text: "Login with IDM",
                  },
                ]}
                name="Login"
              />

            }

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
