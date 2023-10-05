import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type BreadCrumbProps = {
  to: string;
  active?: boolean;
  showSeperator?: boolean;
  seperator?: ReactNode;
};

export const BreadCrumb = ({
  to,
  seperator = <BreadCrumbSeperator />,
  showSeperator = true,
  active = false,
  children,
}: React.PropsWithChildren<BreadCrumbProps>) => {
  const activeClass = "underline";

  return (
    <li className="flex items-center">
      <div>{showSeperator && seperator}</div>
      <Link
        className={twMerge(clsx(active && activeClass), "hover:underline")}
        to={to}
      >
        <div>{children}</div>
      </Link>
    </li>
  );
};

export const BreadCrumbSeperator = () => <ChevronRight className="w-5 h-5" />;

export const BreadCrumbBar = ({ children }: React.PropsWithChildren) => {
  return (
    <nav>
      <ul className="flex flex-col gap-1 lg:flex-row">{children}</ul>
    </nav>
  );
};
