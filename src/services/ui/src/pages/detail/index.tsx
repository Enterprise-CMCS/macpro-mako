<<<<<<< HEAD
=======
import { Link } from "react-router-dom";
>>>>>>> b2ea9f3a56eded28254d3fd383f1504ebc3017a4
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
import { getStatus } from "../dashboard/Lists/statusHelper";
import { OsHit, OsMainSourceItem } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { DetailNav } from "./detailNav";

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
            className="block mb-4 text-blue-700"
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
            <>
              <p className="text-gray-600 font-semibold mb-2">Status</p>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {getStatus(data?._source.status, user?.isCms)}
                </h2>
              </div>
            </>
          </CardWithTopBorder>
        </section>
        <DetailsSection id="package-details" title="Package Details">
          <ChipSpaPackageDetails {...data?._source} />
        </DetailsSection>
        <DetailsSection id="attachments" title="Attachments">
          <Attachmentslist {...data?._source} />
        </DetailsSection>
        <RaiResponses {...data?._source} />
        <DetailsSection id="additional-info" title="Additional Information">
          <AdditionalInfo
            additionalInformation={data?._source.additionalInformation}
          />
        </DetailsSection>
        <SubmissionInfo {...data?._source} />
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
      <DetailNav id={id} type={data?._source.planType} />
      <div className="max-w-screen-xl mx-auto py-8 px-4 lg:px-8">
        <DetailsContent data={data} />
      </div>
    </>
  );
};
