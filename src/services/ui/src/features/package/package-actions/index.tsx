import { useGetItem, useGetPackageActions } from "@/api";
import { LoadingSpinner, Link } from "@/components";
import { mapActionLabel } from "@/utils";
import { DetailCardWrapper } from "..";
import { FC } from "react";
import { useLocation } from "react-router-dom";

export const PackageActionsCard: FC<{ id: string }> = ({ id }) => {
  const location = useLocation();
  const item = useGetItem(id);

  const { data, isLoading } = useGetPackageActions(id, {
    retry: false,
  });
  if (isLoading) return <LoadingSpinner />;

  const authority = item.data?._source.authority;
  return (
    <DetailCardWrapper title={"Package Actions"}>
      <div className="my-3">
        {!data || !data.actions.length ? (
          <em className="text-gray-400 my-3">
            No actions are currently available for this submission.
          </em>
        ) : (
          <ul className="my-3">
            {data.actions.map((type, idx) => (
              <Link
                state={{
                  from: `${location.pathname}${location.search}`,
                }}
                path="/action/:authority/:id/:type"
                key={`${idx}-${type}`}
                params={{ id, type, authority: authority! }}
                query={{
                  origin: "actionsDetails",
                }}
                className="text-sky-700 font-semibold text-lg"
                query={{
                  origin: "actionsDetails",
                }}
              >
                <li>{mapActionLabel(type)}</li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </DetailCardWrapper>
  );
};
