import { Link } from "react-router-dom";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { Button } from "@/components/Button";

export const Authority = () => {
  return (
    <>
      <Link to="/create/Medicaid-SPA">
        <Button>SPA</Button>
      </Link>
      <Link to="/create/Waiver">
        <Button>Waiver</Button>
      </Link>
    </>
  );
};
