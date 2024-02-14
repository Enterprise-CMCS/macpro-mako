import { NavLink, NavLinkProps, Outlet, Link } from "react-router-dom";
import oneMacLogo from "@/assets/onemac_logo.svg";
import { useMediaQuery } from "@/hooks";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useGetUser } from "@/api";
import { Auth } from "aws-amplify";
import { AwsCognitoOAuthOpts } from "@aws-amplify/auth/lib-esm/types";
import { Footer } from "../Footer";
import { UsaBanner } from "../UsaBanner";
import { useUserContext } from "../Context/userContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import config from "@/config";
import { useNavigate } from "../Routing";
import { FAQ_TAB } from "../Routing/consts";
import { ModalProvider } from "@/components/Context/modalContext";
import { AlertProvider } from "@/components/Context/alertContext";

const getLinks = (isAuthenticated: boolean, role?: boolean) => {
  const isProd =
    (window && window.location.hostname === "mako.cms.gov") ||
    window.location.hostname === "onemac.cms.gov";
  return [
    {
      name: "Home",
      link: "/",
      condition: true,
    },
    {
      name: "Dashboard",
      link: "/dashboard",
      condition: isAuthenticated && role,
    },
    {
      name: "FAQ",
      link: "/faq",
      condition: true,
    },
    {
      name: "Webforms",
      link: "/webforms",
      condition: isAuthenticated && !isProd,
    },
  ].filter((l) => l.condition);
};

const UserDropdownMenu = () => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate({ path: "/profile" });
  };

  const handleLogout = async () => {
    await Auth.signOut();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        asChild
        className="hover:text-white/70 p-4 data-[state=open]:bg-white data-[state=open]:text-primary"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="bg-white flex flex-col gap-4 px-10 py-4 shadow-md rounded-b-sm"
        >
          <DropdownMenu.Item className="flex">
            <button
              className="text-primary hover:text-primary/70"
              onClick={handleViewProfile}
            >
              View Profile
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex">
            <button
              className="text-primary hover:text-primary/70"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const Layout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ModalProvider>
      <div className="min-h-full flex flex-col">
        <UsaBanner />
        <nav className="bg-primary">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
            <div className="h-[70px] flex gap-12 items-center text-white">
              <Link to="/">
                <img
                  className="h-10 w-28 min-w-[112px] resize-none"
                  src={oneMacLogo}
                  alt="onemac site logo"
                />
              </Link>
              <ResponsiveNav isDesktop={isDesktop} />
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <AlertProvider>
            <Outlet />
          </AlertProvider>
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
    </ModalProvider>
  );
};

type ResponsiveNavProps = {
  isDesktop: boolean;
};

const ResponsiveNav = ({ isDesktop }: ResponsiveNavProps) => {
  const [prevMediaQuery, setPrevMediaQuery] = useState(isDesktop);
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, isError, data } = useGetUser();
  const userContext = useUserContext();
  const role = useMemo(() => {
    return userContext?.user?.["custom:cms-roles"] ? true : false;
  }, []);

  const handleLogin = () => {
    const authConfig = Auth.configure();
    const { domain, redirectSignIn, responseType } =
      authConfig.oauth as AwsCognitoOAuthOpts;
    const clientId = authConfig.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
    window.location.assign(url);
  };

  const handleRegister = () => {
    const url = `${config.idm.home_url}/signin/login.html`;
    window.location.assign(url);
  };

  if (isLoading || isError) return <></>;

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
        {getLinks(!!data.user, role).map((link) => (
          <NavLink
            to={link.link}
            target={link.link === "/faq" ? FAQ_TAB : "_self"}
            key={link.name}
            className={setClassBasedOnNav}
          >
            {link.name}
          </NavLink>
        ))}
        <div className="flex-1"></div>
        <>
          {data.user ? (
            // When the user is signed in
            <UserDropdownMenu />
          ) : (
            // When the user is not signed in
            <>
              <button
                className="text-white hover:text-white/70"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button
                className="text-white hover:text-white/70"
                onClick={handleRegister}
              >
                Register
              </button>
            </>
          )}
        </>
      </>
    );
  }

  return (
    <>
      <div className="flex-1"></div>
      {isOpen && (
        <div className="w-full fixed top-[100px] left-0 z-50">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-2 gap-4 rounded-lg bg-accent">
            {getLinks(!!data.user, role).map((link) => (
              <li key={link.link}>
                <Link
                  className="block py-2 pl-3 pr-4 text-white rounded"
                  to={link.link}
                  target={link.link === "/faq" ? FAQ_TAB : "_self"}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <>
              {data.user ? (
                // When the user is signed in
                <UserDropdownMenu />
              ) : (
                // When the user is not signed in
                <>
                  <button
                    className="text-left block py-2 pl-3 pr-4 text-white rounded"
                    onClick={handleLogin}
                  >
                    Sign In
                  </button>
                  <button
                    className="text-white hover:text-white/70"
                    onClick={handleRegister}
                  >
                    Register
                  </button>
                </>
              )}
            </>
          </ul>
        </div>
      )}
      <button
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

export const SubNavHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-sky-100">
    <div className="max-w-screen-xl m-auto px-4 lg:px-8">
      <div className="flex items-center">
        <div className="flex align-middle py-4">{children}</div>
      </div>
    </div>
  </div>
);
