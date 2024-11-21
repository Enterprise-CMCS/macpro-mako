import { Navigate, useParams } from "react-router-dom";
import { AmendmentForm as CapitatedForm } from "../../waiver/capitated";
import { AmendmentForm as ContractingForm } from "../../waiver/contracting";
import { useGetItem } from "@/api";

export const Amendment = () => {
  const { id } = useParams();
  const { data: submission } = useGetItem(id);

  const isCapitated = submission._source.changelog.find(
    (event) =>
      event._source.event === "capitated-initial" || event._source.event === "capitated-renewal",
  );
  const isContracting = submission._source.changelog.find(
    (event) =>
      event._source.event === "contracting-initial" ||
      event._source.event === "contracting-renewal",
  );

  if (isCapitated) {
    return <CapitatedForm waiverId={id} />;
  }

  if (isContracting) {
    return <ContractingForm waiverId={id} />;
  }

  return <Navigate to="/dashboard" />;
};
