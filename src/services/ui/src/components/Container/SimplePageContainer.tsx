import { PropsWithChildren } from "react";
import { Alert } from "../Alert";
import { Button } from "../Inputs";
import { Link } from "../Routing";

export const SimplePageContainer = ({ children }: PropsWithChildren) => (
  <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
    {children}
    <Alert
      variant={"infoBlock"}
      className="my-12 items-center flex py-8 px-14 flex-row text-sm justify-center gap-24"
    >
      <p className="text-lg">Do you have questions or need support?</p>
      <Link path="/faq" target="_blank">
        <Button className="mx-4" size="lg">
          View FAQ
        </Button>
      </Link>
    </Alert>
  </div>
);
