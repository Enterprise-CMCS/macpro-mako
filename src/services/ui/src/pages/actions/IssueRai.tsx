import { useParams } from "react-router-dom";
import * as I from "@/components/Inputs";
import { API } from "aws-amplify";

export const IssueRai = () => {
  const { id, type } = useParams<{
    id: string;
    type: string;
  }>();

  async function handleClick() {
    API.post("os", "/action", {
      body: {
        id: id,
        action: "issueRai",
      },
    });
  }

  return (
    <div>
      <span>ID: {id}</span>
      <br />
      <span>Type: {type}</span>
      <p>
        <br />
        <I.Button
          type="button"
          variant="outline"
          onClick={() => handleClick()}
          className="px-12"
        >
          Issue RAI
        </I.Button>
      </p>
    </div>
  );
};
