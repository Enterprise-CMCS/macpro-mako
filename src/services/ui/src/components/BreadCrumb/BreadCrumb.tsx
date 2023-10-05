import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type BreadCrumbProps = {
  to: string;
  active?: boolean;
};

export const BreadCrumb = ({
  to,
  active = false,
  children,
}: React.PropsWithChildren<BreadCrumbProps>) => {
  const activeClass = "underline";
  return (
    <Link
      className={twMerge(clsx(active && activeClass), "hover:underline")}
      to={to}
    >
      {children}
    </Link>
  );
};

export const BreadCrumbBar = ({ children }: React.PropsWithChildren) => {
  return <div className="flex flex-col lg:flex-row">{children}</div>;
};
