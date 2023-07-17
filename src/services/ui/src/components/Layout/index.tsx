import { Link, NavLink, NavLinkProps, Outlet } from "react-router-dom";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import oneMacLogo from "@/assets/onemac_logo.svg";

export const Layout = () => {
  const setClassBasedOnNav: NavLinkProps["className"] = ({ isActive }) =>
    isActive ? "underline underline-offset-4 decoration-4" : "";

  return (
    <div className="min-h-full flex flex-col">
      <UI.UsaBanner />
      <div className="bg-primary">
        <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
          <div className="h-[70px] flex gap-12 items-center text-white">
            <Link to="/">
              <img
                className="h-10 w-28 resize-none"
                src={oneMacLogo}
                alt="One Mac Site Logo"
              />
            </Link>
            <NavLink to="/" className={setClassBasedOnNav}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={setClassBasedOnNav}>
              Dashboard
            </NavLink>
            <div className="flex-1"></div>
            <button className="text-white">Sign In</button>
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
