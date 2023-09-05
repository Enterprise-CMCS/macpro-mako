import { DetailWrapper } from "./wrapper";
import { Link } from "@enterprise-cmcs/macpro-ux-lib";
import {
  AdditionalInfo,
  Attachmentslist,
  CardWithTopBorder,
  ChipSpaPackageDetails,
  DetailsSection,
  LoadingSpinner,
  RaiResponses,
  SubmissionInfo,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { getStatus } from "../dashboard/Lists/statusHelper";
import { OsHit, OsMainSourceItem } from "shared-types";

export const ChipSpa = ({ data }: { data?: OsHit<OsMainSourceItem> }) => {
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
          {/* <CardWithTopBorder>
            <>
              <p className="tw-text-gray-600 tw-font-semibold tw-mb-2">
                Package Actions
              </p>
              <div className="tw-flex tw-flex-col tw-gap-y-2">
                <Link
                  href="#"
                  style={{
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  {" "}
                  Withdraw Package
                </Link>
                <Link
                  href="#"
                  style={{ textDecoration: "none", fontWeight: 700 }}
                >
                  {" "}
                  Issue Formal RAI
                </Link>
              </div>
            </>
          </CardWithTopBorder> */}
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

export const ChipSpaPage = () => (
  <DetailWrapper>
    <ChipSpa />
  </DetailWrapper>
);
