import { Link } from "@/components";
import { mapActionLabel } from "@/utils";
import { DetailCardWrapper } from "..";
import { FC } from "react";
import { useLocation } from "react-router-dom";
import type { opensearch } from "shared-types";
import { useGetUser } from "@/api";
import { getAvailableActions } from "shared-utils";

export const PackageActionsCard: FC<{
  id: string;
  data: opensearch.main.Document;
}> = ({ id, data }) => {
  const location = useLocation();
  const { data: user } = useGetUser();
  console.log("getAvailableActions", data);

  const actions = getAvailableActions(user!.user!, data);

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
                state={{
                  from: `${location.pathname}${location.search}`,
                }}
                path="/action/:authority/:id/:type"
                key={`${idx}-${type}`}
                params={{ id, type, authority: data.authority }}
                query={{
                  origin: "actionsDetails",
                }}
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
