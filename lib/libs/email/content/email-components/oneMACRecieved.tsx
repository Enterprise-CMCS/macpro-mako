import * as React from "react";
import { Html } from "@react-email/components";

export const OneMACRecieved = (props: { submission: string }) => {
  return (
    <Html lang="en" dir="ltr">
      <p>The OneMAC Submission Portal received a {props.submission}:</p>
    </Html>
  );
};
