import { useGetIssues } from "../../api/useGetIssues";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { TrashIcon } from "@heroicons/react/24/outline";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";

export const IssueList = () => {
  const { isLoading, isError, data } = useGetIssues();

  if (isLoading) return <>Loading...</>;
  if (isError) return <>Error...</>;

  return (
    <>
      <h3 className="text-4xl text-center">Issues</h3>
      <ul className="mx-auto max-w-sm flex flex-col gap-4">
        {data.map((issue) => (
          <li>
            <Link
              to={`/issue/view/${issue.id}`}
              className="cursor-pointer w-full justify-center items-center flex flex-row shadow-md p-4"
            >
              <div className="flex flex-col flex-1">
                <span className="text-lg">{issue.title}</span>
                {/* <span className="font-light">
                  {formatDistance(new Date(issue.updatedAt), new Date())} ago
                </span> */}
              </div>
              <TrashIcon className="h-6 w-6" />
            </Link>
          </li>
        ))}
      </ul>
      <UI.Button
        buttonText="New Issue"
        onClick={() => console.log("add routing here")}
      />
    </>
  );
};
