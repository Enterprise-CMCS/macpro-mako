import * as UI from "@/components";
import { XCircleIcon } from "lucide-react";
import { ReactQueryApiError } from "shared-types";

export const ErrorAlert = ({ error }: { error: ReactQueryApiError }) => {
  let message = "An error has occured";

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  }
  return (
    // <UI.Alert alertBody={message} alertHeading="Error" variation="error" />
    <UI.Alert className="border-2" variant="destructive">
      <XCircleIcon className="w-6 h-6" />
      <UI.AlertTitle>Error</UI.AlertTitle>
      <UI.AlertDescription>{message}</UI.AlertDescription>
    </UI.Alert>
  );
};
