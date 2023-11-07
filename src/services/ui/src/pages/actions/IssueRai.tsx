import { useParams } from "react-router-dom";

export const IssueRai = () => {
  const { id, type } = useParams<{
    id: string;
    type: string;
  }>();

  return (
    <div>
      <span>ID: {id}</span>
      <span>Type: {type}</span>
    </div>
  );
};
