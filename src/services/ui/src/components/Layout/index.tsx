import { Link, NavLink, NavLinkProps, Outlet } from "react-router-dom";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import oneMacLogo from "@/assets/onemac_logo.svg";
import { useMediaQuery } from "@/hooks";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

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
    ];
  } else {
    return [
      {
        name: "Home",
        link: "/",
      },
    ];
  }
};

export const Layout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="min-h-full flex flex-col">
      <UI.UsaBanner />
      <div className="bg-primary">
        <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
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
      <UI.Footer emailAddress="test@test.test" />
    </div>
  );
};

type ResponsiveNavProps = {
  isDesktop: boolean;
};
const ResponsiveNav = ({ isDesktop }: ResponsiveNavProps) => {
  const [prevMediaQuery, setPrevMediaQuery] = useState(isDesktop);
  const [isOpen, setIsOpen] = useState(false);

  const setClassBasedOnNav: NavLinkProps["className"] = ({ isActive }) =>
    isActive
      ? "underline underline-offset-4 decoration-4 hover:text-white/70"
      : "hover:text-white/70";

  if (prevMediaQuery !== isDesktop) {
    console.log("running");
    setPrevMediaQuery(isDesktop);
    setIsOpen(false);
  }

  if (isDesktop)
    return (
      <>
        {getLinks(true).map((link) => (
          <NavLink
            to={link.link}
            key={link.name}
            className={setClassBasedOnNav}
          >
            {link.name}
          </NavLink>
        ))}
        <div className="flex-1"></div>
        <button className="text-white hover:text-white/70">Sign In</button>
      </>
    );

  return (
    <>
      <div className="flex-1"></div>
      {isOpen && (
        <div className="w-full fixed top-[100px] left-0">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-2 gap-4 rounded-lg bg-accent">
            {getLinks(true).map((link) => (
              <li key={link.link}>
                <Link
                  onClick={() => setIsOpen(false)}
                  className='"block py-2 pl-3 pr-4 text-white rounded'
                  to={link.link}
                >
                  {link.name}
                </Link>
              </li>
            ))}
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
