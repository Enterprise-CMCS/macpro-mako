import { useGetItemCache } from "@/api";
import { Link } from "@/components";
import { mapActionLabel } from "@/utils";
import { DetailCardWrapper } from "..";
import { FC } from "react";
import { useLocation } from "react-router-dom";

import type { opensearch } from "shared-types";

export const PackageActionsCard: FC<{
  id: string;
  data: opensearch.main.Document;
}> = ({ id, data }) => {
  const location = useLocation();

  const { data: item, actions } = useGetItemCache(id);

  const authority = item.authority;

  return (
    <DetailCardWrapper title={"Package Actions"}>
      <div className="my-3">
        {!data || !actions.length ? (
          <em className="text-gray-400 my-3">
            No actions are currently available for this submission.
          </em>
        ) : (
          <ul className="my-3">
            {actions.map((type, idx) => (
              <Link
                state={{ from: `${location.pathname}${location.search}` }}
                path="/action/:authority/:id/:type"
                key={`${idx}-${type}`}
                params={{ id, type, authority: authority }}
                className="text-sky-700 font-semibold text-lg"
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
