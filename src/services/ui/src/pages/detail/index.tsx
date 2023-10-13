import {
  AdditionalInfo,
  Attachmentslist,
  CardWithTopBorder,
  ChipSpaPackageDetails,
  DetailsSection,
  ErrorAlert,
  LoadingSpinner,
  RaiResponses,
  SubmissionInfo,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { OsHit, OsMainSourceItem } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { DetailNav } from "./detailNav";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { BREAD_CRUMB_CONFIG_PACKAGE_DETAILS } from "@/components/BreadCrumb/bread-crumb-config";

export const DetailsContent = ({
  data,
}: {
  data?: OsHit<OsMainSourceItem>;
}) => {
  const { data: user } = useGetUser();
  if (!data?._source) return <LoadingSpinner />;
  return (
    <div className="block md:flex">
      <aside className="flex-none font-bold hidden md:block pr-8">
        {[
          "Package Overview",
          "Package Details",
          "Attachments",
          "Additional Info",
        ].map((val) => (
          <a
            className="block mb-4 text-primary"
            key={val}
            href={`?id=${encodeURIComponent(data._id)}#${val
              .toLowerCase()
              .split(" ")
              .join("-")}`}
          >
            {val}
          </a>
        ))}
      </aside>
      <div className="flex-1">
        <section id="package-overview" className="block md:flex mb-8 gap-8">
          <CardWithTopBorder>
            <div className="p-4">
              <p className="text-gray-600 font-semibold mb-2">Status</p>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {user?.isCms
                    ? data._source.cmsStatus
                    : data._source.stateStatus}
                </h2>
              </div>
            </div>
          </CardWithTopBorder>
        </section>
        <DetailsSection id="package-details" title="Package Details">
          <ChipSpaPackageDetails {...data?._source} />
        </DetailsSection>
        <SubmissionInfo {...data?._source} />
        {/* Below is used for spacing. Keep it simple */}
        <div className="mb-4" />
        <DetailsSection id="attachments" title="Attachments">
          <Attachmentslist {...data?._source} />
        </DetailsSection>
        <DetailsSection id="additional-info" title="Additional Information">
          <AdditionalInfo
            additionalInformation={data?._source.additionalInformation}
          />
        </DetailsSection>
        <RaiResponses {...data?._source} />
      </div>
    </div>
  );
};

export const Details = () => {
  const query = useQuery();
  const id = query.get("id") as string;
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <>
      {/* <DetailNav id={id} type={data?._source.planType} /> */}
      <div className="max-w-screen-xl mx-auto py-1 px-4 lg:px-8 flex flex-col gap-4">
        <BreadCrumbs options={BREAD_CRUMB_CONFIG_PACKAGE_DETAILS({ id })} />
        <DetailsContent data={data} />
      </div>
    </>
  );
};
