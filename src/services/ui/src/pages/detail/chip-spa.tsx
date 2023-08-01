import { SearchData } from "@/api";
import { DetailWrapper } from "./wrapper";
import { Link } from "@enterprise-cmcs/macpro-ux-lib";
import { CardWithTopBorder } from "@/components";

const ChipSpa = ({ data }: { data?: SearchData }) => {
  console.log({ data });
  return (
    <div className="block md:flex">
      <aside className="flex-none font-bold hidden md:block">
        {[
          "Package Overview",
          "Package Details",
          "Attachments",
          "Additional info",
        ].map((val) => (
          <Link
            className="w-full"
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
        <section className="flex flex-wrap">
          <CardWithTopBorder title="Status">
            <h3 className="text-xl font-semibold mb-2">Pending</h3>
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
        <div id="package-details">
          <div className="grid grid-cols-2 gap-4">
            <div>01</div>
            <div>01</div>
            <div>01</div>
            <div>01</div>
            <div>01</div>
          </div>
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
