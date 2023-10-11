import { Link, NavLink, NavLinkProps, Outlet } from "react-router-dom";
import oneMacLogo from "@/assets/onemac_logo.svg";
import { useMediaQuery } from "@/hooks";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useGetUser } from "@/api/useGetUser";
import { Auth } from "aws-amplify";
import { AwsCognitoOAuthOpts } from "@aws-amplify/auth/lib-esm/types";
import { Footer } from "../Footer";
import { UsaBanner } from "../UsaBanner";
import { BreadCrumb, BreadCrumbBar } from "../BreadCrumb";

const getLinks = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return [
      {
        name: "Home",
        link: "/",
      },
      {
        name: "Dashboard",
        link: "/dashboard",
      },
      {
        name: "FAQ",
        link: "/faq",
      },
    ];
  } else {
    return [
      {
        name: "Home",
        link: "/",
      },
      {
        name: "FAQ",
        link: "/faq",
      },
    ];
  }
};

export const Layout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="min-h-full flex flex-col">
      <UsaBanner />
      <div className="bg-primary">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          <div className="h-[70px] flex gap-12 items-center text-white">
            <Link to="/">
              <img
                className="h-10 w-28 min-w-[112px] resize-none"
                src={oneMacLogo}
                alt="One Mac Site Logo"
              />
            </Link>
            <ResponsiveNav isDesktop={isDesktop} />
          </div>
        </div>
      </div>
      <main className="flex-1">
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
const ResponsiveNav = ({ isDesktop }: ResponsiveNavProps) => {
  const [prevMediaQuery, setPrevMediaQuery] = useState(isDesktop);
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, isError, data } = useGetUser();

  const handleLogin = () => {
    const authConfig = Auth.configure();
    const { domain, redirectSignIn, responseType } =
      authConfig.oauth as AwsCognitoOAuthOpts;
    const clientId = authConfig.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

    window.location.assign(url);
  };

  const handleLogout = async () => {
    await Auth.signOut();
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
        {getLinks(!!data.user).map((link) => (
          <NavLink
            to={link.link}
            key={link.name}
            className={setClassBasedOnNav}
          >
            {link.name}
          </NavLink>
        ))}
        <div className="flex-1"></div>
        <>
          {data.user ? (
            <button
              className="text-white hover:text-white/70"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          ) : (
            <button
              className="text-white hover:text-white/70"
              onClick={handleLogin}
            >
              Sign In
            </button>
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
            {getLinks(!!data.user).map((link) => (
              <li key={link.link}>
                <Link
                  onClick={() => setIsOpen(false)}
                  className="block py-2 pl-3 pr-4 text-white rounded"
                  to={link.link}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <>
              {data.user ? (
                <button
                  className="text-left block py-2 pl-3 pr-4 text-white rounded"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              ) : (
                <button
                  className="text-left block py-2 pl-3 pr-4 text-white rounded"
                  onClick={handleLogin}
                >
                  Sign In
                </button>
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
