import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { ReactQueryApiError } from "shared-types";

export const ErrorAlert = ({ error }: { error: ReactQueryApiError }) => {
  let message = "An error has occured";
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  }
  return (
    <UI.Alert alertBody={message} alertHeading="Error" variation="error" />
  );
};
