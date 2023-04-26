import { useParams } from "react-router-dom";
import { z } from "zod";
import { useGetIssue } from "../../api/useGetIssue";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { formatDistance } from "date-fns";
import { useUpdateissue } from "../../api/useUpdateIssue";
import { LoadingSpinner } from "../../components";

export const ViewIssue = () => {
  const { id } = useParams();
  const { mutateAsync, isLoading: updateLoading } = useUpdateissue();
  const validId = z.string().parse(id);

  const { isLoading, isError, data: issue, refetch } = useGetIssue(validId);

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <UI.Alert
        alertBody={"An Error Occured. Please try again later."}
        alertHeading="Error"
        variation="error"
      />
    );

  return (
    <div className="max-w-screen-lg mx-auto px-8">
      <div className="flex items-center justify-between my-4">
        <UI.Typography size="lg" as="h1">
          {issue.title}
        </UI.Typography>
        <UI.Typography as="p" size="2xs">
          {formatDistance(new Date(issue.createdAt), new Date())} ago
        </UI.Typography>
      </div>
      <UI.Typography as="p" size="md">
        {issue.description}
      </UI.Typography>
      <br />
      <div className="flex items-center justify-between my-4">
        <div>
          <UI.Typography as="p" size="md">
            priority - {issue.priority}
          </UI.Typography>
          <UI.Typography as="p" size="md">
            type - {issue.type}
          </UI.Typography>
        </div>
        <div>
          <input
            type="checkbox"
            id="resolved"
            name="resolved"
            className="mr-1"
            checked={issue.resolved}
            disabled={updateLoading}
            onChange={async (e) => {
              await mutateAsync({ ...issue, resolved: e.target.checked });
              refetch();
            }}
          />
          <label htmlFor="scales">Resolved</label>
        </div>
      </div>
    </div>
  );
};
