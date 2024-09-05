import * as React from "react";
import { Html, Link } from "@react-email/components";

export const LoginInstructions = (props: { appEndpointURL: string }) => {
  return (
    <Html lang="en" dir="ltr">
      <ul>
        <li>
          The submission can be accessed in the OneMAC application, which you
          can find at{" "}
          <Link href={props.appEndpointURL}>{props.appEndpointURL}</Link>.
        </li>
        <li>
          If you are not already logged in, please click the "Login" link at the
          top of the page and log in using your Enterprise User Administration
          (EUA) credentials.
        </li>
        <li>
          After you have logged in, you will be taken to the OneMAC application.
          The submission will be listed on the dashboard page, and you can view
          its details by clicking on its ID number.
        </li>
      </ul>
    </Html>
  );
};

export const PackageDetails = (props: {
  details: { [key: string]: string | null };
}) => {
  return (
    <Html lang="en" dir="ltr">
      {Object.keys(props.details).map((label: string) => {
        if (label === "Summary") {
          return (
            <>
              <br />
              Summary:
              <p>
                {props.details[label] ?? "No additional information submitted"}
              </p>
            </>
          );
        }
        return (
          <>
            <b>{label}:</b> {props.details[label] ?? "Unknown"}
          </>
        );
      })}
    </Html>
  );
};

export const MailboxSPA = () => {
  return (
    <Html lang="en" dir="ltr">
      <p>
        This mailbox is for the submittal of State Plan Amendments and non-web
        based responses to Requests for Additional Information (RAI) on
        submitted SPAs only. Any other correspondence will be disregarded.
      </p>
    </Html>
  );
};

export const MailboxWaiver = () => {
  return (
    <Html lang="en" dir="ltr">
      <p>
        This mailbox is for the submittal of Section 1915(b) and 1915(c)
        Waivers, responses to Requests for Additional Information (RAI) on
        Waivers, and extension requests on Waivers only. Any other
        correspondence will be disregarded
      </p>
    </Html>
  );
};

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

export const ContactStateLead = (props: { isChip?: boolean }) => {
  return (
    <Html lang="en" dir="ltr">
      <p>
        If you have questions or did not expect this email, please contact
        {props.isChip ? (
          <a href="mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov">
            CHIPSPASubmissionMailBox@CMS.HHS.gov
          </a>
        ) : (
          <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a>
        )}
        or your state lead.
      </p>
      <p>Thank you!</p>
    </Html>
  );
};
