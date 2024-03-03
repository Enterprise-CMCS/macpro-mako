import { useGetPackageActions } from "@/api";
import { LoadingSpinner, Link } from "@/components";
import { mapActionLabel } from "@/utils";
import { useLocation } from "react-router-dom";
import { Authority } from "shared-types";
import { DetailCardWrapper } from "..";

export const PackageActionsCard = ({
  id,
  authority,
}: {
  id: string;
  authority: Authority;
}) => {
  const location = useLocation();
  const { data, isLoading } = useGetPackageActions(id, { retry: false });
  if (isLoading) return <LoadingSpinner />;

  return (
    <DetailCardWrapper title={"package_actions"}>
      <div>
        {!data || !data.actions.length ? (
          <em className="text-gray-400 my-4">
            No actions are currently available for this submission.
          </em>
        ) : (
          <ul className="my-4">
            {data.actions.map((type, idx) => {
              if (authority === Authority["1915b"]) {
                return (
                  <Link
                    state={{ from: `${location.pathname}${location.search}` }}
                    path="/action/:authority/:id/:type"
                    key={`${idx}-${type}`}
                    params={{ id, type, authority }}
                    className="text-sky-700 font-semibold"
                  >
                    <li>{mapActionLabel(type)}</li>
                  </Link>
                );
              } else {
                return (
                  <Link
                    key={`${idx}-${type}`}
                    path="/action/:id/:type"
                    params={{ id, type }}
                    className="text-sky-700 font-semibold"
                  >
                    <li>{mapActionLabel(type)}</li>
                  </Link>
                );
              }
            })}
          </ul>
        )}
      </div>
    </DetailCardWrapper>
  );
};
