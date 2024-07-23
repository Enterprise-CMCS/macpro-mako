import { AUTHORITY } from "shared-types";
import { useParams } from "@/components";

export const PackageSection = () => {
  const { id, authority } = useParams("/action/:authority/:id/:type");
  const lcAuthority = authority.toLowerCase();
  // We should pass in the already lowercased Authority, right?  todo
  return (
    <section className="flex flex-col mb-8 space-y-8">
      <div>
        <p>
          {[AUTHORITY["CHIP SPA"], AUTHORITY["Medicaid SPA"]].includes(
            authority.toLowerCase(),
          ) && "Package ID"}
          {[AUTHORITY["1915(b)"], AUTHORITY["1915(c)"]].includes(
            authority.toLowerCase(),
          ) && "Waiver Number"}
        </p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Authority</p>
        <p className="text-xl">
          {lcAuthority === AUTHORITY["1915(b)"] && "1915(b) Waiver"}
          {lcAuthority === AUTHORITY["1915(c)"] && "1915(c) Waiver"}
          {lcAuthority === AUTHORITY["CHIP SPA"] && "CHIP SPA"}
          {lcAuthority === AUTHORITY["Medicaid SPA"] && "Medicaid SPA"}
        </p>
      </div>
    </section>
  );
};
