import { useGetIssues } from "../../api/useGetIssues";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { FaceFrownIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { useDeleteIssue } from "../../api/useDeleteIssue";
import { Modal } from "../../components/Modal";
import { AddIssueForm, LoadingSpinner } from "../../components";
import { GetIssue } from "shared-types";

export const IssueRow = ({
  issue,
  handleDelete,
}: {
  issue: GetIssue;
  handleDelete: (id: string) => Promise<void>;
}) => (
  <tr key={issue.id}>
    <UI.TH rowHeader>
      <Link className="cursor-pointer text-blue-600" to={`/issues/${issue.id}`}>
        {issue.title}
      </Link>
    </UI.TH>
    <UI.TD>{issue.description}</UI.TD>
    <UI.TD>{issue.priority}</UI.TD>
    <UI.TD>{issue.type}</UI.TD>
    <UI.TD>{formatDistance(new Date(issue.createdAt), new Date())} ago</UI.TD>
    <UI.TD>
      <div className="w-8">
        {issue.resolved ? <FaceSmileIcon /> : <FaceFrownIcon />}
      </div>
    </UI.TD>
    <UI.TD>
      <UI.Button
        buttonText="Delete"
        buttonVariation="link"
        onClick={() => handleDelete(issue.id)}
      />
    </UI.TD>
  </tr>
);

export const IssueList = () => {
  const { isLoading, isError, data } = useGetIssues();
  const { mutate: deleteIssue } = useDeleteIssue();

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="max-w-screen-lg mx-auto px-8">
        <UI.Alert
          alertBody={"An Error Occured. Please try again later."}
          alertHeading="Error"
          variation="error"
        />
      </div>
    );

  const handleDelete = async (id: string) => {
    await deleteIssue(id);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-8">
      <div className="flex items-center justify-between my-4">
        <UI.Typography size="lg" as="h1">
          Issues
        </UI.Typography>
        <Modal title="Add Issue" buttonText="Add">
          <AddIssueForm />
        </Modal>
      </div>
      <hr />
      <UI.Table borderless id="om-issues-table">
        <thead>
          <tr>
            <UI.TH>Title</UI.TH>
            <UI.TH>Description</UI.TH>
            <UI.TH>Priority</UI.TH>
            <UI.TH>Type</UI.TH>
            <UI.TH>Created</UI.TH>
            <UI.TH>Resolved</UI.TH>
            <UI.TH> </UI.TH>
          </tr>
        </thead>
        <tbody>
          {data.map((issue) => {
            return (
              <IssueRow
                issue={issue}
                handleDelete={handleDelete}
                key={issue.id}
              />
            );
          })}
        </tbody>
      </UI.Table>
    </div>
  );
};
