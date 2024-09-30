import { Alert, Button } from "@/components";
import { Link } from "react-router-dom";

export const FAQFooter = () => {
  return (
    <Alert
      variant={"infoBlock"}
      className="my-8 items-center flex py-8 px-14 flex-row text-sm justify-center gap-24"
    >
      <p className="text-lg">Do you have questions or need support?</p>
      <Link to="/faq" target="_blank">
        <Button className="mx-4" size="lg">
          View FAQ
        </Button>
      </Link>
    </Alert>
  );
};
