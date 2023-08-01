import { SearchData } from "@/api";
import { DetailWrapper } from "./wrapper";
import { Link } from "@enterprise-cmcs/macpro-ux-lib";
import {
  AdditionalInfo,
  Attachmentslist,
  CardWithTopBorder,
  ChipSpaPackageDetails,
  DetailsSection,
  SubmissionInfo,
} from "@/components";

export const ChipSpa = ({ data }: { data?: SearchData }) => {
  console.log({ data });
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
      <div>
        <section id="package-overview" className="block md:flex mb-8 gap-8">
          <CardWithTopBorder title="Status">
            <div>
              <h2 className="text-xl font-semibold mb-2">Pending</h2>
            </div>
          </CardWithTopBorder>
          <CardWithTopBorder title="Package Actions">
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
          </CardWithTopBorder>
        </section>
        <DetailsSection id="package-details" title="CHIP SPA Package Details">
          <ChipSpaPackageDetails />
        </DetailsSection>

        <DetailsSection
          id="attachments"
          title="Attachments"
          description="Maximum file size of 80MB."
        >
          <Attachmentslist />
        </DetailsSection>
        <DetailsSection
          id="additional-info"
          title="Additional Information"
          description="Add anything else that you would like to share with CMS."
        >
          <AdditionalInfo />
          <SubmissionInfo />
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
