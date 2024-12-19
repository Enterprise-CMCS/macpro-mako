import { NavLink, NavLinkProps, Outlet, Link, useNavigate } from "react-router";
import oneMacLogo from "@/assets/onemac-logo.png";
import { useMediaQuery } from "@/hooks";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useGetUser } from "@/api";
import { Auth } from "aws-amplify";
import { AwsCognitoOAuthOpts } from "@aws-amplify/auth/lib-esm/types";
import { Footer } from "../Footer";
import { UsaBanner } from "../UsaBanner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import config from "@/config";
import { ScrollToTop, SimplePageContainer, UserPrompt, Banner } from "@/components";
import { isFaqPage, isProd } from "@/utils";
import MMDLAlertBanner from "@/components/Banner/MMDLSpaBanner";

/**
 * Custom hook that generates a list of navigation links based on the user's status and whether the current page is the FAQ page.
 *
 * @returns {Object} An object containing:
 * - `links`: An array of link objects with `name`, `link`, and `condition` properties.
 * - `isFaqPage`: A boolean indicating if the current page is the FAQ page.
 */
const useGetLinks = () => {
  const { isLoading, data: userObj } = useGetUser();

  const links =
    isLoading || isFaqPage
      ? []
      : [
          {
            name: "Home",
            link: "/",
            condition: true,
          },
          {
            name: "Dashboard",
            link: "/dashboard",
            condition: userObj.user && userObj.user["custom:cms-roles"],
          },
          {
            name: "FAQ",
            link: "/faq",
            condition: true,
          },
          {
            name: "Webforms",
            link: "/webforms",
            condition: userObj.user && !isProd,
          },
        ].filter((l) => l.condition);

  return { links, isFaqPage };
};

/**
 * UserDropdownMenu component renders a dropdown menu for user actions.
 *
 * This component provides options for viewing the user's profile and signing out.
 * It uses the `useNavigate` hook for navigation and `Auth.signOut` for logging out.
 *
 * The dropdown menu is not rendered on the FAQ page.
 *
 * @component
 * @example
 * return (
 *   <UserDropdownMenu />
 * )
 *
 * @returns {JSX.Element} The rendered dropdown menu component.
 */
const UserDropdownMenu = () => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await Auth.signOut();
  };

  if (isFaqPage) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        asChild
        className="hover:text-white/70 py-2 pl-3 pr-4 data-[state=open]:bg-white data-[state=open]:text-primary"
      >
        <button className="flex flex-row gap-4 items-center cursor-pointer">
          <p className="flex">My Account</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.0}
            stroke="currentColor"
            className="w-4 h-4 flex"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="bg-white z-50 flex flex-col gap-4 px-10 py-4 shadow-md rounded-b-sm "
        >
          <DropdownMenu.Item className="flex">
            <button className="text-primary hover:text-primary/70" onClick={handleViewProfile}>
              View Profile
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex">
            <button className="text-primary hover:text-primary/70" onClick={handleLogout}>
              Sign Out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

/**
 * Layout component that serves as the main structure of the application.
 * It includes a navigation bar, main content area, and footer.
 *
 * @returns {JSX.Element} The rendered Layout component.
 *
 * @component
 * @example
 * return (
 *   <Layout />
 * )
 *
 * @remarks
 * - Uses `useMediaQuery` to determine if the screen width is at least 768px.
 * - Fetches user data using `useGetUser` hook.
 * - Displays a `UserPrompt` component.
 * - Displays a `UsaBanner` component, indicating if the user is missing a role.
 * - Contains a navigation bar with a logo and a `ResponsiveNav` component.
 * - The logo is a clickable `Link` unless on the FAQ page, where it is a non-clickable `div`.
 * - The main content area includes a `SimplePageContainer` with a `Banner` and an `Outlet` for nested routes.
 * - The footer displays contact information.
 */
export const Layout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: user } = useGetUser();
  const customUserRoles = user?.user?.["custom:cms-roles"];

  return (
    <div className="min-h-full flex flex-col">
      <ScrollToTop />
      <UserPrompt />
      {user?.user && !isFaqPage && <MMDLAlertBanner />}
      <UsaBanner isUserMissingRole={user?.user && customUserRoles === undefined} />
      <nav data-testid="nav-banner-d" className="bg-primary">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          <div className="h-[70px] relative flex gap-12 items-center text-white">
            {!isFaqPage ? (
              // This is the original Link component
              <Link to="/">
                <img
                  className="h-10 w-28 min-w-[112px] resize-none"
                  src={oneMacLogo}
                  alt="onemac site logo"
                />
              </Link>
            ) : (
              // This is a non-clickable element that looks the same
              <div>
                <img
                  className="h-10 w-28 min-w-[112px] resize-none"
                  src={oneMacLogo}
                  alt="onemac site logo"
                />
              </div>
            )}
            <ResponsiveNav isDesktop={isDesktop} />
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <SimplePageContainer>
          <Banner />
        </SimplePageContainer>
        <Outlet />
      </main>
      <Footer
        email="OneMAC_Helpdesk@cms.hhs.gov"
        address={{
          city: "Baltimore",
          state: "MD",
          street: "7500 Security Boulevard",
          zip: 21244,
        }}
      />
    </div>
  );
};

type ResponsiveNavProps = {
  isDesktop: boolean;
};

/**
 * ResponsiveNav component renders a navigation bar that adapts to desktop and mobile views.
 * It displays navigation links and user authentication buttons (Sign In/Register) based on the user's authentication status.
 *
 * @param {ResponsiveNavProps} props - The properties for the ResponsiveNav component.
 * @param {boolean} props.isDesktop - A boolean indicating if the current view is desktop.
 *
 * @returns {JSX.Element | null} The rendered navigation bar component.
 *
 * @component
 *
 * @example
 * // Usage example:
 * <ResponsiveNav isDesktop={true} />
 *
 * @remarks
 * - The component uses `useGetLinks` to fetch navigation links.
 * - The component uses `useGetUser` to fetch user data.
 * - The component conditionally renders different layouts for desktop and mobile views.
 * - The component handles user authentication redirection for login and registration.
 */
const ResponsiveNav = ({ isDesktop }: ResponsiveNavProps) => {
  const [prevMediaQuery, setPrevMediaQuery] = useState(isDesktop);
  const [isOpen, setIsOpen] = useState(false);
  const { links } = useGetLinks();
  const { isLoading, isError, data } = useGetUser();

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

  if (isLoading || isError) return null;

  const setClassBasedOnNav: NavLinkProps["className"] = ({ isActive }) =>
    isActive
      ? "underline underline-offset-4 decoration-4 hover:text-white/70"
      : "hover:text-white/70";
  if (prevMediaQuery !== isDesktop) {
    setPrevMediaQuery(isDesktop);
    setIsOpen(false);
  }

  if (isDesktop) {
    return (
      <>
        {links.map((link) => (
          <NavLink
            data-testid={`${link.name}-d`}
            to={link.link}
            target={link.link === "/faq" ? "_blank" : "_self"}
            key={link.name}
            className={setClassBasedOnNav}
          >
            {link.name}
          </NavLink>
        ))}
        <div className="flex-1"></div>
        {data.user ? (
          // When the user is signed in
          <UserDropdownMenu />
        ) : (
          !isFaqPage && (
            // When the user is not signed in
            <>
              <button
                data-testid="sign-in-button-d"
                className="text-white hover:text-white/70"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button
                data-testid="register-button-d"
                className="text-white hover:text-white/70"
                onClick={handleRegister}
              >
                Register
              </button>
            </>
          )
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex-1"></div>
      {isOpen && (
        <div className="w-full absolute top-[100px] sm:top-[85px] left-0 z-50">
          <ul className="font-medium flex flex-col items-start p-4 md:p-0 mt-2 gap-4 rounded-b-lg bg-primary">
            {links.map((link) => (
              <li key={link.link}>
                <Link
                  data-testid={`${link.name}-m`}
                  className="block py-2 pl-3 pr-4 text-white rounded"
                  to={link.link}
                  target={link.link === "/faq" ? "_blank" : "_self"}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {data.user ? (
              // When the user is signed in
              <UserDropdownMenu />
            ) : (
              !isFaqPage && (
                // When the user is not signed in
                <>
                  <button
                    className="text-left block py-2 pl-3 pr-4 text-white rounded"
                    onClick={handleLogin}
                  >
                    Sign In
                  </button>
                  <button
                    className="text-left block py-2 pl-3 pr-4 text-white rounded"
                    onClick={handleRegister}
                  >
                    Register
                  </button>
                </>
              )
            )}
          </ul>
        </div>
      )}
      <button
        data-testid="mobile-menu-button"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {!isOpen && <Bars3Icon className="w-6 h-6 min-w-[24px]" />}
        {isOpen && <XMarkIcon className="w-6 h-6 min-w-[24px]" />}
      </button>
    </>
  );
};

/**
 * SubNavHeader component
 *
 * This component renders a sub-navigation header with a background color and
 * centers its children content within a maximum width container.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The content to be displayed inside the sub-navigation header.
 *
 * @returns {JSX.Element} The rendered sub-navigation header component.
 */
export const SubNavHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-sky-100" data-testid="sub-nav-header">
    <div className="max-w-screen-xl m-auto px-4 lg:px-8">
      <div className="flex items-center">
        <div className="flex align-middle py-4">{children}</div>
      </div>
    </div>
  </div>
);
