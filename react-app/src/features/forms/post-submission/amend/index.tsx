import { Navigate, useParams } from "react-router-dom";
import { AmendmentForm as CapitatedForm } from "../../waiver/capitated";
import { AmendmentForm as ContractingForm } from "../../waiver/contracting";
import { useGetItem } from "@/api";

export const Amendment = () => {
  const { id } = useParams();
  const item = useGetItem(id);
  const isCapitated = item.data._source.changelog.find(
    (event) =>
      event._source.event === "capitated-initial" || event._source.event === "capitated-renewal",
  );
  const isContracting = item.data._source.changelog.find(
    (event) =>
      event._source.event === "contracting-initial" ||
      event._source.event === "contracting-renewal",
  );

  if (isCapitated) {
    return <CapitatedForm />;
  } else if (isContracting) {
    return <ContractingForm />;
  } else {
    // there is probably an error or someone is doing something they shouldn't
    return <Navigate to="/dashboard" />;
  }
};
