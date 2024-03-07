import { CardWithTopBorder, ErrorAlert, LoadingSpinner } from "@/components";
import { opensearch } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { PropsWithChildren } from "react";

import { PackageActivities } from "./package-activity";
import { AdminChanges } from "./admin-changes";

import { PackageDetails } from "./package-details";
import { detailsAndActionsCrumbs } from "../actions";
import { PackageStatusCard } from "./package-status";
import { PackageActionsCard } from "./package-actions";
import { useDetailsSidebarLinks } from "./hooks";

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

export const DetailsContent = ({
  data,
}: {
  data?: opensearch.main.ItemResult;
}) => {
  if (!data?._source) return <LoadingSpinner />;
  return (
    <div className="w-full py-1 px-4 lg:px-8">
      <section
        id="package_overview"
        className="block md:flex space-x-0 md:space-x-8"
      >
        <PackageStatusCard {...data._source} />
        <PackageActionsCard id={data._id} authority={data._source.authority!} />
      </section>
      <div className="flex flex-col gap-3 mr-0 sm:mr-3 md:mr-10">
        <PackageDetails {...data._source} />
        <PackageActivities {...data._source} />
        <AdminChanges {...data._source} />
      </div>
    </div>
  );
};

export const Details = () => {
  const query = useQuery();
  const id = query.get("id") as string;
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) return <LoadingSpinner />;
  if (!data?._source) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div className="max-w-screen-xl mx-auto flex px-4 lg:px-8">
      <div className="hidden lg:block">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id })} />
        <DetailsSidebar data={data} />
      </div>
      <DetailsContent data={data} />
    </div>
  );
};

const DetailsSidebar = ({ data }: { data: opensearch.main.ItemResult }) => {
  const links = useDetailsSidebarLinks(data._id);

  return (
    <aside className="min-w-56 flex-none font-semibold m-4 mt-6 pr-8">
      {links.map(({ id, href, displayName }) => (
        <a className="block mb-2 text-blue-900" key={id} href={href}>
          {displayName}
        </a>
      ))}
    </aside>
  );
};
