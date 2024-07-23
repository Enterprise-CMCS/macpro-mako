import { useParams } from "react-router-dom";
import { Authority } from "shared-types";

export const PackageSection = () => {
  const { id, authority } = useParams<{ id: string; authority: Authority }>();

  return (
    <section className="flex flex-col mb-8 space-y-8">
      <div>
        <p>
          {(authority === "CHIP SPA" || authority === "Medicaid SPA") &&
            "Package ID"}
          {(authority === "1915(b)" || authority === "1915(c)") &&
            "Waiver Number"}
        </p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Authority</p>
        <p className="text-xl">
          {authority === "1915(b)" && "1915(b) Waiver"}
          {authority === "1915(c)" && "1915(c) Waiver"}
          {authority === "CHIP SPA" && "CHIP SPA"}
          {authority === "Medicaid SPA" && "Medicaid SPA"}
        </p>
      </div>
    </section>
  );
};
