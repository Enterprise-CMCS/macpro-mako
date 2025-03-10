import { useGetPackageActions } from "@/api";
import { LoadingSpinner } from "@/components";
import { WAIVER_SUBMISSION_ORIGIN, DETAILS_ORIGIN, ORIGIN, mapActionLabel } from "@/utils";
import { DetailCardWrapper } from "..";
import { Link, useLocation } from "react-router";
import { opensearch } from "shared-types";

type PackageActionsCardProps = {
  id: string;
  submission: opensearch.main.Document;
};

export const PackageActionsCard = ({ submission, id }: PackageActionsCardProps) => {
  const location = useLocation();

  const { data, isLoading } = useGetPackageActions(id, {
    retry: false,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data?.actions?.length) {
    return (
      <DetailCardWrapper title={"Package Actions"}>
        <div className="my-3">
          <em className="text-gray-400 my-3">
            No actions are currently available for this submission.
          </em>
        </div>
      </DetailCardWrapper>
    );
  }

  return (
    <DetailCardWrapper title={"Package Actions"}>
      <div className="my-3">
        <ul className="my-3">
          {data.actions.map((type, idx) => (
            <Link
              key={`${idx}-${type}`}
              state={{
                from: `${location.pathname}${location.search}`,
              }}
              to={{
                pathname: `/actions/${type}/${submission.authority}/${id}`,
                search: new URLSearchParams({
                  [ORIGIN]:
                    type === "amend-waiver" || type === "temporary-extension"
                      ? WAIVER_SUBMISSION_ORIGIN
                      : DETAILS_ORIGIN,
                }).toString(),
              }}
              className="text-sky-700 font-semibold text-lg"
            >
              <li>{mapActionLabel(type)}</li>
            </Link>
          ))}
        </ul>
      </div>
    </DetailCardWrapper>
  );
};
