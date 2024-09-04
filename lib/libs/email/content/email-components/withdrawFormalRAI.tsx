import * as React from "react";
import { Html } from "@react-email/components";

export const WithdrawRAI = (props: {
  id: string;
  submitterName: string;
  submitterEmail: string;
}) => {
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a request to withdraw the Formal
        RAI Response. You are receiving this email notification as the Formal
        RAI for {props.id} was withdrawn by {props.submitterName}{" "}
        {props.submitterEmail}.
      </p>
    </Html>
  );
};
