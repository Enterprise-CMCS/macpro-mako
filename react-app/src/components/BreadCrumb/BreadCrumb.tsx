import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router";

type BreadCrumbsProps = {
  options: BreadCrumbConfig[];
};

export type BreadCrumbConfig = {
  order: number;
  to: string;
  displayText: string;
};

export const BreadCrumbs = ({ options }: BreadCrumbsProps) => {
  return (
    <BreadCrumbBar>
      {/* After this we map over the config and check to see if the breadcrumb needs to be displayed. Proper route paths are important here. It should be hierarchical */}
      {options
        .toSorted((option, prevOption) => option.order - prevOption.order)
        .map(({ displayText, to }, index, optionsArray) => {
          return (
            <BreadCrumb key={displayText} to={to} active={index === optionsArray.length - 1}>
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
  separator?: ReactNode;
};

export const BreadCrumb = ({
  to,
  separator = <BreadCrumbSeparator />,
  active,
  children,
}: React.PropsWithChildren<BreadCrumbProps>) => {
  return (
    <li className="flex items-center text-sm">
      {active ? (
        <span className="whitespace-nowrap" aria-current="page">
          {children}
        </span>
      ) : (
        <>
          <Link to={to} className="underline text-sky-700 hover:text-sky-800">
            {children}
          </Link>
          <span className="ml-1" aria-hidden="true">
            {separator}
          </span>
        </>
      )}
    </li>
  );
};

export const BreadCrumbSeparator = () => (
  <ChevronRight className="w-5 h-5" focusable={false} aria-hidden="true" />
);

export const BreadCrumbBar = ({ children }: React.PropsWithChildren) => {
  return (
    <nav aria-label="Breadcrumb" className="my-4">
      <ol className="flex flex-wrap gap-1">{children}</ol>
    </nav>
  );
};
