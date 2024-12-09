import { CardWithTopBorder, ErrorAlert, LoadingSpinner } from "@/components";

import { useGetItem, useGetItemCache, getItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { FC, PropsWithChildren } from "react";

import { PackageActivities } from "./package-activity";
import { AdminChanges } from "./admin-changes";

import { PackageDetails } from "./package-details";
import { PackageStatusCard } from "./package-status";
import { PackageActionsCard } from "./package-actions";
import { useDetailsSidebarLinks } from "./hooks";
import { Authority } from "shared-types";
import { LoaderFunctionArgs, useLoaderData, useParams, redirect } from "react-router-dom";
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

  return (
    <div className="w-full py-1 px-4 lg:px-8">
      <section id="package_overview" className="block md:flex space-x-0 md:space-x-8">
        <PackageStatusCard id={id} />
        <PackageActionsCard id={id} />
      </section>
      <div className="flex flex-col gap-3">
        <PackageDetails itemResult={data} />
        <PackageActivities />
        <AdminChanges />
      </div>
    </div>
  );
};

export const packageDetailsLoader = async ({ params }: LoaderFunctionArgs) => {
  const { id, authority } = params;
  if (id === undefined || authority === undefined) {
    return redirect("/dashboard");
  }

  try {
    const packageResult = await getItem(id);
    if (!packageResult || packageResult?._source?.deleted === true) {
      return redirect("/dashboard");
    }
  } catch (error) {
    console.log("Error: ", error);
    return redirect("/dashboard");
  }

  return { id, authority };
};

type LoaderData = {
  id: string;
  authority: Authority;
};

export const Details = () => {
  const { id, authority } = useLoaderData<typeof packageDetailsLoader>();
  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
      <div className="px-4 lg:px-8">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id, authority })} />
        <div className="hidden lg:block pr-8">
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
    <aside className="min-w-56 flex-none font-semibold mt-6">
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
