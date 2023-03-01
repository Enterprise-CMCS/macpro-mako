import {
  ActionsMenu,
  Button,
  Header,
  Link,
  Logo,
  Footer,
  UsaBanner,
} from "@enterprise-cmcs/macpro-ux-lib";
import cmsLogo from "@enterprise-cmcs/macpro-ux-lib/build/assets/img/logos/cms_logo.svg";


export const Home = () => {
  return (
    <>
    <Header
      headerLogo={
        <Link href="" title="Project Title">
          <Logo altText="Project Logo" source={cmsLogo} />
        </Link>
      }
      navData={[
        {
          buttonText: "Current Section",
          columns: [
            [
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
            ],
            [
              {
                href: "",
                text: "Navigational Link",
              },
            ],
            [
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
            ],
            [
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
            ],
          ],
        },
        {
          buttonText: "Section",
          columns: [
            [
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
              {
                href: "",
                text: "Navigational Link",
              },
            ],
          ],
        },
      ]}
      secondaryComponent={
        <ActionsMenu
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
  <Footer emailAddress="storybook-test@cms.hhs.gov" />
</>
);
};
