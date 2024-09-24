import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type BreadCrumbsProps = {
  options: BreadCrumbConfig[];
};

export type BreadCrumbConfig = {
  default?: boolean;
  order: number;
  to: string;
  displayText: string;
};

export const BreadCrumbs = ({ options }: BreadCrumbsProps) => {
  const defaultBreadCrumb = options.find((option) => option.default);

  return (
    <BreadCrumbBar>
      {defaultBreadCrumb && (
        <BreadCrumb to={defaultBreadCrumb.to} showSeperator={false}>
          {defaultBreadCrumb.displayText}
        </BreadCrumb>
      )}
      {/* After this we map over the config and check to see if the breadcrumb needs to be displayed. Proper route paths are important here. It should be hierarchical */}
      {options
        .filter((option) => !option.default)
        .toSorted((option, prevOption) => option.order - prevOption.order)
        .map(({ displayText, to }, index, optionsArray) => {
          return (
            <BreadCrumb
              key={displayText}
              to={to}
              active={index !== optionsArray.length - 1}
            >
              {displayText}
            </BreadCrumb>
          );
        })}
    </BreadCrumbBar>
  );
};

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
  active = true,
  children,
}: React.PropsWithChildren<BreadCrumbProps>) => {
  return (
    <li className="flex items-center text-sm">
      {showSeperator && <span>{seperator}</span>}

      {active && (
        <Link to={to} className="underline text-sky-700 hover:text-sky-800">
          {children}
        </Link>
      )}
      {!active && (
        <span className="whitespace-nowrap" aria-disabled>
          {children}
        </span>
      )}
    </li>
  );
};

export const BreadCrumbSeperator = () => <ChevronRight className="w-5 h-5" />;

export const BreadCrumbBar = ({ children }: React.PropsWithChildren) => {
  return (
    <nav
      role="navigation"
      aria-label="breadcrumbs for spa or waiver choices"
      className="my-4"
    >
      <ul className="flex gap-1">{children}</ul>
    </nav>
  );
};
