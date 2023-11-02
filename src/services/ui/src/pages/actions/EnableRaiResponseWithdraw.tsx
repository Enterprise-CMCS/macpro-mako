import { useParams } from "react-router-dom";

export const EnableRaiResponseWithdraw = () => {
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
