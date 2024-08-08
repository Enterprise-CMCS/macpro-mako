import { useParams } from "react-router-dom";
import { Authority } from "shared-types";

export const PackageSection = () => {
  const { id, authority } = useParams<{ id: string; authority: Authority }>();
  const lcAuthority = authority.toLowerCase();
  // We should pass in the already lowercased Authority, right?  todo
  return (
    <section className="flex flex-col mb-8 space-y-8">
      <div>
        <p>
          {[Authority.CHIP_SPA, Authority.MED_SPA].includes(
            authority.toLowerCase() as Authority,
          ) && "Package ID"}
          {[Authority["1915b"], Authority["1915c"]].includes(
            authority.toLowerCase() as Authority,
          ) && "Waiver Number"}
        </p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Authority</p>
        <p className="text-xl">
          {lcAuthority === Authority["1915b"] && "1915(b) Waiver"}
          {lcAuthority === Authority["1915c"] && "1915(c) Waiver"}
          {lcAuthority === Authority["CHIP_SPA"] && "CHIP SPA"}
          {lcAuthority === Authority["MED_SPA"] && "Medicaid SPA"}
        </p>
      </div>
    </section>
  );
};
