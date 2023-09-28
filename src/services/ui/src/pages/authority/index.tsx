import { Link } from "react-router-dom";
import { Button } from "@/components/Inputs";

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
