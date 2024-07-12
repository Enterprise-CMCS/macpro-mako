import { CardWithTopBorder, ErrorAlert, LoadingSpinner } from "@/components";

import { useGetItem, useGetItemCache } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { FC, PropsWithChildren } from "react";

import { PackageActivities } from "./package-activity";
import { AdminChanges } from "./admin-changes";

import { PackageDetails } from "./package-details";
import { PackageStatusCard } from "./package-status";
import { PackageActionsCard } from "./package-actions";
import { useDetailsSidebarLinks } from "./hooks";
import { Authority, AuthorityUnion } from "shared-types";
import { Navigate, useParams } from "react-router-dom";
import { detailsAndActionsCrumbs } from "@/utils";

export const DetailCardWrapper = ({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) => (
  <CardWithTopBorder>
    <div className="p-4 py-1 w-80 min-h-36">
      <h2>{title}</h2>
      {children}
    </div>
  </CardWithTopBorder>
);

export const DetailsContent: FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) return <LoadingSpinner />;
  if (!data?._source) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  const title =
    (() => {
      switch (data._source.authority) {
        case Authority["1915b"]:
        case Authority["1915c"]:
        case undefined: // Some TEs have no authority
          if (data._source.appkParent)
            return "Appendix K Amendment Package Details";
          else if (data._source.actionType == "Extend")
            return "Temporary Extension Request Details";
          else return undefined;
        default:
          return undefined;
      }
    })() || `${data._source.authority} Package Details`;

  return (
    <div className="w-full py-1 px-4 lg:px-8">
      <section
        id="package_overview"
        className="block md:flex space-x-0 md:space-x-8"
      >
        <PackageStatusCard id={id} />
        <PackageActionsCard id={id} />
      </section>
      <div className="flex flex-col gap-3">
        <PackageDetails title={title} />
        <PackageActivities />
        <AdminChanges />
      </div>
    </div>
  );
};

export const Details = () => {
  const { id, authority } = useParams<{
    id: string;
    authority: AuthorityUnion;
  }>();

  if (id === undefined || authority === undefined) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row px-4 lg:px-8">
      <div>
        <BreadCrumbs options={detailsAndActionsCrumbs({ id, authority })} />
        <div className="hidden lg:block">
          <DetailsSidebar id={id} />
        </div>
      </div>
      <DetailsContent id={id} />
    </div>
  );
};

const DetailsSidebar: FC<{ id: string }> = ({ id }) => {
  const links = useDetailsSidebarLinks(id);

  return (
    <aside className="min-w-56 flex-none font-semibold m-4 mt-6 pr-8 pl-4">
      {links.map(({ id, href, displayName }) => (
        <a className="block mb-2 text-blue-900" key={id} href={href}>
          {displayName}
        </a>
      ))}
    </aside>
  );
};

export const usePackageDetailsCache = () => {
  const { id } = useParams<{ id: string }>();

  return useGetItemCache(id);
};
