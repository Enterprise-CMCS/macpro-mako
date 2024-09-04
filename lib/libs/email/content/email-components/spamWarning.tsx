import * as React from "react";
import { Html } from "@react-email/components";

export const SpamWarning = () => {
  return (
    <Html lang="en" dir="ltr">
      <p>
        If the contents of this email seem suspicious, do not open them, and
        instead forward this email to{" "}
        <a href="mailto:SPAM@cms.hhs.gov">SPAM@cms.hhs.gov</a>.
      </p>
      <p>Thank you!</p>
    </Html>
  );
};
