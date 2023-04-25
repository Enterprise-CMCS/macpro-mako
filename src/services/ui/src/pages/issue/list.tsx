import { useGetIssues } from "../../api/useGetIssues";
import { Link, useNavigate } from "react-router-dom";
import { formatDistance } from "date-fns";
import { FaceFrownIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";

export const IssueList = () => {
  const { isLoading, isError, data } = useGetIssues();
  const navigate = useNavigate();

  if (isLoading) return <>Loading...</>;
  if (isError) return <>Error...</>;

  return (
    <div className="max-w-screen-lg mx-auto px-8">
      <UI.Table borderless caption="Issues" id="om-issues-table">
        <thead>
          <tr>
            <UI.TH>Title</UI.TH>
            <UI.TH>Description</UI.TH>
            <UI.TH>Priority</UI.TH>
            <UI.TH>Type</UI.TH>
            <UI.TH>Created At</UI.TH>
            <UI.TH>Resolved</UI.TH>
          </tr>
        </thead>
        <tbody>
          {data.map((issue) => {
            return (
              <tr
                className="cursor-pointer"
                onClick={() => navigate(`/issue/view/${issue.id}`)}
              >
                <UI.TH rowHeader>{issue.title}</UI.TH>
                <UI.TD>{issue.description}</UI.TD>
                <UI.TD>{issue.priority}</UI.TD>
                <UI.TD>{issue.type}</UI.TD>
                <UI.TD>
                  {formatDistance(new Date(issue.createdAt), new Date())} ago
                </UI.TD>
                <UI.TD>
                  <div className="w-8">
                    {issue.resolved ? <FaceSmileIcon /> : <FaceFrownIcon />}
                  </div>
                </UI.TD>
              </tr>
            );
          })}
        </tbody>
      </UI.Table>
    </div>
  );
};
