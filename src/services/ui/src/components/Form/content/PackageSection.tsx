import { SeatoolAuthority } from "shared-types";
import { useParams } from "@/components";

export const PackageSection = () => {
  const { id, authority } = useParams("/action/:authority/:id/:type");
  const lcAuthority = authority.toLowerCase();
  // We should pass in the already lowercased Authority, right?  todo
  return (
    <section className="flex flex-col mb-8 space-y-8">
      <div>
        <p>
          {[SeatoolAuthority.CHIPSPA, SeatoolAuthority.MedicaidSPA].includes(
            authority.toLowerCase(),
          ) && "Package ID"}
          {[SeatoolAuthority["1915b"], SeatoolAuthority["1915c"]].includes(
            authority.toLowerCase(),
          ) && "Waiver Number"}
        </p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Authority</p>
        <p className="text-xl">
          {lcAuthority === SeatoolAuthority["1915b"] && "1915(b) Waiver"}
          {lcAuthority === SeatoolAuthority["1915c"] && "1915(c) Waiver"}
          {lcAuthority === SeatoolAuthority.CHIPSPA && SeatoolAuthority.CHIPSPA}
          {lcAuthority === SeatoolAuthority.MedicaidSPA &&
            SeatoolAuthority.MedicaidSPA}
        </p>
      </div>
    </section>
  );
};
