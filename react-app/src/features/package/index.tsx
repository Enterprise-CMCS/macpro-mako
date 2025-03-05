import { CardWithTopBorder, ErrorAlert, LoadingSpinner } from "@/components";

import { useGetItem, getItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { PropsWithChildren } from "react";

import { PackageActivities } from "./package-activity";
import { AdminPackageActivities } from "./admin-changes";

import { PackageDetails } from "./package-details";
import { PackageStatusCard } from "./package-status";
import { PackageActionsCard } from "./package-actions";
import { useDetailsSidebarLinks } from "./hooks";
import { Authority } from "shared-types";
import { LoaderFunctionArgs, useLoaderData, redirect } from "react-router";
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

type DetailsContentProps = {
  id: string;
};

export const DetailsContent = ({ id }: DetailsContentProps) => {
  const { data: record, isLoading, error } = useGetItem(id);

  if (isLoading) return <LoadingSpinner />;

  if (error) return <ErrorAlert error={error} />;

  const { _source: submission } = record;

  return (
    <div className="w-full py-1 px-4 lg:px-8">
      <section id="package_overview" className="block md:flex space-x-0 md:space-x-8">
        <PackageStatusCard submission={submission} />
        <PackageActionsCard id={id} submission={submission} />
      </section>
      <div className="flex flex-col gap-3">
        <PackageDetails submission={submission} />
        <PackageActivities id={id} changelog={submission.changelog} />
        <AdminPackageActivities changelog={submission.changelog} />
      </div>
    </div>
  );
};

type LoaderData = {
  id: string;
  authority: Authority;
};

export const packageDetailsLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<LoaderData | Response> => {
  const { id, authority } = params;
  if (id === undefined || authority === undefined) {
    return redirect("/dashboard");
  }

  try {
    const packageResult = await getItem(id);
    if (!packageResult || packageResult._source.deleted === true || packageResult.found === false) {
      return redirect("/dashboard");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error fetching package: ", error.message);
    } else {
      console.log("Unknown error fetching package: ", error);
    }
    return redirect("/dashboard");
  }

  return { id, authority: authority as Authority };
};

export const Details = () => {
  const { id, authority } = useLoaderData<LoaderData>();
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

type DetailsSidebarProps = {
  id: string;
};

const DetailsSidebar = ({ id }: DetailsSidebarProps) => {
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
