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
import { format } from "date-fns";


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
              <h2 className="text-xl font-semibold mb-2">{data?._source.status || "Unknown"}</h2>
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
          <ChipSpaPackageDetails {...{
            "SPA ID": data?._id,
            Type: data?._source.programType,
            State: data?._source.state,
            "Sub-Type": data?._source.planType,
            "Initial Submission Date": formatOrNull(data?._source.submission_date),
            "Proposed Effective Date": formatOrNull(data?._source.proposedDate),
            "Approved Effective Date": formatOrNull(data?._source.approvedEffectiveDate),
            "Change Date": formatOrNull(data?._source.changedDate),
          }}/>
        </DetailsSection>

        <DetailsSection
          id="attachments"
          title="Attachments"
          description="Maximum file size of 80MB."
        >
          <Attachmentslist {...{attachments: data?._source.attachments}} />
        </DetailsSection>
        <DetailsSection
          id="additional-info"
          title="Additional Information"
          description="Add anything else that you would like to share with CMS."
        >
          <AdditionalInfo {...{additionalInformation: data?._source.additionalInformation}}/>
          <SubmissionInfo {...{
            submitterName: data?._source.submitterName,
            submitterEmail: data?._source.submitterEmail,
            submissionOrigin: data?._source.submissionOrigin,
            leadAnalyst: data?._source.leadAnalyst

          }}/>
        </DetailsSection>
      </div>
    </div>
  );
};

function formatOrNull(timestamp:any) {
  return timestamp ? format(timestamp, "MM/dd/yyyy") : null
}

export const ChipSpaPage = () => (
  <DetailWrapper>
    <ChipSpa />
  </DetailWrapper>
);
