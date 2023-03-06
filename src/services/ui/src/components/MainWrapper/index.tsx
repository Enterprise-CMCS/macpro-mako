import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import cmsLogo from "@enterprise-cmcs/macpro-ux-lib/build/assets/img/logos/cms_logo.svg";
import { ReactFragment } from "react";

export const MainWrapper = ({ children }: { children: ReactFragment }) => {
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
            buttonText: "Section One",
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
            buttonText: "Section Two",
            columns: [
              [
                {
                  href: "/posts",
                  text: "Posts",
                },
              ],
            ],
          },
        ]}
        secondaryComponent={
          <UI.ActionsMenu
            links={[
              {
                href: "",
                iconName: "person",
                onClick: function noRefCheck() {},
                target: "_blank",
                text: "Manage Profile",
              },
              {
                href: "",
                iconName: "people",
                onClick: function noRefCheck() {},
                target: "_blank",
                text: "Request Role Change",
              },
              {
                href: "",
                iconName: "logout",
                onClick: function noRefCheck() {},
                target: "_blank",
                text: "Log Out",
              },
            ]}
            name="My Account"
          />
        }
      />
      <main className="padding-x-5" style={{ flex: 1 }}>
        {children}
      </main>
      <UI.Footer style={{ marginTop: "auto" }} emailAddress="QPP@cms.hhs.gov" />
    </div>
  );
};
