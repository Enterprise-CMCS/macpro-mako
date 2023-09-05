import { Link } from "@enterprise-cmcs/macpro-ux-lib";
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
    <div className="tw-block md:tw-flex">
      <aside className="tw-flex-none tw-font-bold tw-hidden md:tw-block tw-pr-8">
        {[
          "Package Overview",
          "Package Details",
          "Attachments",
          "Additional Info",
        ].map((val) => (
          <Link
            key={val}
            href={`#${val.toLowerCase().split(" ").join("-")}`}
            style={{
              display: "block",
              textDecoration: "none",
              marginBottom: "16px",
            }}
            text={val}
          />
        ))}
      </aside>
      <div className="tw-flex-1">
        <section
          id="package-overview"
          className="tw-block md:tw-flex tw-mb-8 tw-gap-8"
        >
          <CardWithTopBorder>
            <>
              <p className="tw-text-gray-600 tw-font-semibold tw-mb-2">
                Status
              </p>
              <div>
                <h2 className="tw-text-xl tw-font-semibold tw-mb-2">
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
      <div className="tw-max-w-screen-xl tw-mx-auto tw-py-8 tw-px-4 tw-lg:px-8">
        <DetailsContent data={data} />
      </div>
    </>
  );
};
