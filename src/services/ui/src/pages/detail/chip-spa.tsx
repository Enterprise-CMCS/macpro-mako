import { SearchData } from "@/api";
import { DetailWrapper } from "./wrapper";
import { Link } from "@enterprise-cmcs/macpro-ux-lib";
import {
  AdditionalInfo,
  Attachmentslist,
  CardWithTopBorder,
  ChipSpaPackageDetails,
  SubmissionInfo,
} from "@/components";

const ChipSpa = ({ data }: { data?: SearchData }) => {
  console.log({ data });
  return (
    <div className="block md:flex">
      <aside className="flex-none font-bold hidden md:block">
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
      <div id="package-overview" className="pl-8">
        <section className="flex flex-wrap mb-8">
          <CardWithTopBorder title="Status">
            <h2 className="text-xl font-semibold mb-2">Pending</h2>
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
        <div id="package-details" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            CHIP SPA Package Details
          </h2>
          <ChipSpaPackageDetails />
        </div>
        <div id="attachments" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Attachments</h2>
          <p className="mb-2 text-sm">Maximum file size of 80MB.</p>
          <Attachmentslist />
        </div>
        <div id="additional-info" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
          <p className="mb-4 text-sm">
            Add anything else that you would like to share with CMS.
          </p>
          <AdditionalInfo />
          <hr className="my-4" />
          <SubmissionInfo />
        </div>
      </div>
    </div>
  );
};

export const ChipSpaPage = () => (
  <DetailWrapper>
    <ChipSpa />
  </DetailWrapper>
);
