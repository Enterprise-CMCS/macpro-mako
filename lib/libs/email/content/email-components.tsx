import * as React from "react";
import { Html, Link } from "@react-email/components";
import {
  Attachment,
  AttachmentKey,
  AttachmentTitle,
  attachmentTitleMap,
} from "shared-types";

export const LoginInstructions = (props: { appEndpointURL: string }) => {
  return (
    <Html lang="en" dir="ltr">
      <ul style={{ maxWidth: "760px" }}>
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
  summary: string | null;
}) => {
  return (
    <Html lang="en" dir="ltr">
      <table style={{ borderCollapse: "collapse", maxWidth: "460px" }}>
        <tbody>
          {Object.entries(props.details).map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #ddd" }}>
              <td align="left" style={{ padding: "8px", fontWeight: "bold" }}>
                {label}:
              </td>
              <td align="left" style={{ padding: "8px" }}>
                {value ?? "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Summary:</h3>
      {props.summary ? (
        <p style={{ maxWidth: "760px" }}>{props.summary}</p>
      ) : (
        <i>No Additional Information Provided</i>
      )}
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
      <br />
      <p>Thank you!</p>
    </Html>
  );
};

export const formatAttachments = (
  formatType: "text" | "html",
  attachmentList?: Attachment[] | null,
): React.JSX.Element | React.JSX.Element[] => {
  if (!attachmentList || attachmentList.length === 0) {
    return (
      <Html lang="en" dir="ltr">
        <p>No attachments</p>
      </Html>
    );
  }

  const formatters = {
    text: (
      attachments: {
        title: string;
        filename: string;
      }[],
    ) => (
      <Html lang="en" dir="ltr">
        {attachments.map((a) => (
          <p>
            {a.title}:{" "}
            <a
              color="blue"
              style={{ textDecoration: "underline" }}
              href={a.filename}
              target="_blank"
            >
              {a.filename}
            </a>
          </p>
        ))}
      </Html>
    ),
    html: (
      attachments: {
        title: string;
        filename: string;
      }[],
    ) => (
      <Html lang="en" dir="ltr">
        {attachments.map((a: { title: string; filename: string }) => (
          <p>
            {a.title}:{" "}
            <a
              color="blue"
              style={{ textDecoration: "underline" }}
              href={a.filename}
              target="_blank"
            >
              {a.filename}
            </a>
          </p>
        ))}
      </Html>
    ),
  };

  const formatter = formatters[formatType];
  if (!formatter) {
    console.warn(`Unexpected format type: ${formatType}`);
    return (
      <Html lang="en" dir="ltr">
        <p>Attachment List</p>
      </Html>
    );
  }

  const formattedAttachments = attachmentList.map((a) => {
    const title: AttachmentTitle =
      a.title in attachmentTitleMap
        ? attachmentTitleMap[a.title as AttachmentKey]
        : a.title;
    return { title, filename: a.filename };
  });

  return formatter(formattedAttachments);
};
