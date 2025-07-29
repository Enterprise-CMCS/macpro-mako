import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

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
        <BreadCrumb to={defaultBreadCrumb.to} showSeparator={false}>
          {defaultBreadCrumb.displayText}
        </BreadCrumb>
      )}
      {/* After this we map over the config and check to see if the breadcrumb needs to be displayed. Proper route paths are important here. It should be hierarchical */}
      {options
        .filter((option) => !option.default)
        .toSorted((option, prevOption) => option.order - prevOption.order)
        .map(({ displayText, to }, index, optionsArray) => {
          return (
            <BreadCrumb key={displayText} to={to} active={index !== optionsArray.length - 1}>
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
  showSeparator?: boolean;
  separator?: ReactNode;
  children?: string;
};

const triggerGAEvent = (children: string | undefined) => {
  const pathName = window.location.pathname;
  let submissionType;
  if (pathName.includes("chip")) {
    submissionType = "chip";
  } else if (pathName.includes("medicaid")) {
    submissionType = "medicaid";
  } else if (pathName.includes("temporary-extensions")) {
    submissionType = "temporary-extension";
  } else if (pathName.includes("/waiver/b/b4/initial")) {
    submissionType = "1915b_waiver_initial";
  } else if (pathName.includes("/waiver/b/b4/renewal/")) {
    submissionType = "1915b_waiver_renewal";
  } else if (pathName.includes("/waiver/b/b4/amendment/")) {
    submissionType = "1915b_waiver_ammendment";
  } else if (pathName.includes("/waiver/app-k")) {
    submissionType = "app-k";
  }

  if (submissionType) {
    sendGAEvent("submit_breadcrumb_click", {
      crumb_name: typeof children === "string" ? children : undefined,
      submission_type: submissionType,
    });
  } else {
    sendGAEvent("breadcrumb_click", {
      breadcrumb_text: typeof children === "string" ? children : undefined,
    });
  }
};

export const BreadCrumb = ({
  to,
  separator = <BreadCrumbSeparator />,
  showSeparator = true,
  active = true,
  children,
}: React.PropsWithChildren<BreadCrumbProps>) => {
  return (
    <li className="flex items-center text-sm">
      {showSeparator && <span>{separator}</span>}

      {active && (
        <Link
          to={to}
          className="underline text-sky-700 hover:text-sky-800"
          onClick={() => {
            triggerGAEvent(children);
          }}
        >
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

export const BreadCrumbSeparator = () => <ChevronRight className="w-5 h-5" />;

export const BreadCrumbBar = ({ children }: React.PropsWithChildren) => {
  return (
    <nav role="navigation" aria-label="breadcrumbs for spa or waiver choices" className="my-4">
      <ul className="flex flex-wrap gap-1">{children}</ul>
    </nav>
  );
};
