import { DetailWrapper } from "./wrapper";
import { Link } from "@enterprise-cmcs/macpro-ux-lib";
import {
  AdditionalInfo,
  Attachmentslist,
  CardWithTopBorder,
  ChipSpaPackageDetails,
  DetailsSection,
  LoadingSpinner,
  SubmissionInfo,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { getStatus } from "../dashboard/Lists/statusHelper";
import { OsHit, OsMainSourceItem } from "shared-types";

export const ChipSpa = ({ data }: { data?: OsHit<OsMainSourceItem> }) => {
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
          {/* <CardWithTopBorder>
            <>
              <p className="text-gray-600 font-semibold mb-2">
                Package Actions
              </p>
              <div className="flex flex-col gap-y-2">
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
        <DetailsSection id="additional-info" title="Additional Information">
          <AdditionalInfo
            additionalInformation={data?._source.additionalInformation}
          />
          <SubmissionInfo {...data?._source} />
        </DetailsSection>
      </div>
    </div>
  );
};

export const ChipSpaPage = () => (
  <DetailWrapper>
    <ChipSpa />
  </DetailWrapper>
);
