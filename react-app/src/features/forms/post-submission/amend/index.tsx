import { Navigate, useParams } from "react-router";
import { AmendmentForm as CapitatedForm } from "@/features/forms/waiver/capitated";
import { AmendmentForm as ContractingForm } from "@/features/forms/waiver/contracting";
import { useGetItem } from "@/api";
import { LoadingSpinner } from "@/components";

export const Amendment = () => {
  const { id } = useParams();
  const { data: submission, isLoading: isSubmissionLoading } = useGetItem(id);

  if (submission == undefined && isSubmissionLoading === true) {
    return <LoadingSpinner />;
  }

  if (submission == undefined && isSubmissionLoading === false) {
    return <Navigate to="/dashboard" />;
  }

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
