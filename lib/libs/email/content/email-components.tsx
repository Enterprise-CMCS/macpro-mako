import { Text, Link, Section } from "@react-email/components";
import { Attachment } from "shared-types";

export const LoginInstructions = (props: { appEndpointURL: string }) => {
  return (
    <Section>
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
    </Section>
  );
};

export const Attachments = (props: { attachments: Attachment[] }) => {
  if (!props.attachments || props.attachments?.length === 0)
    return <Text>No attachments</Text>;
  return (
    <>
      <br />
      <p style={{ margin: ".5em" }}>
        <b>Files:</b>
      </p>
      <ul>
        {props.attachments?.map((attachment, idx: number) => (
          <li key={attachment.key + idx}>
            {attachment.title}: {attachment.filename}
          </li>
        ))}
      </ul>
    </>
  );
};

export const PackageDetails = (props: {
  details: { [key: string]: string | null | undefined };
  attachments?: Attachment[] | null;
}) => {
  return (
    <Section>
      <br />
      {Object.keys(props.details).map((label: string, idx: number) => {
        if (label === "Summary") {
          const summary =
            "label" in props.details && props.details.label
              ? props.details.label
              : "No additional information submitted";
          return (
            <div key={label + idx}>
              <br />
              <p style={{ margin: ".5em" }}>
                <b>Summary:</b>
              </p>
              <p style={{ margin: ".5em" }}>{summary}</p>
            </div>
          );
        }
        return (
          <p key={label + idx} style={{ margin: ".5em" }}>
            <b>{label}:</b> {props.details[label] ?? "Unknown"}
          </p>
        );
      })}
      {props.attachments && <Attachments attachments={props.attachments} />}
      <br />
    </Section>
  );
};

export const MailboxSPA = () => {
  return (
    <p>
      This mailbox is for the submittal of State Plan Amendments and non-web
      based responses to Requests for Additional Information (RAI) on submitted
      SPAs only. Any other correspondence will be disregarded.
    </p>
  );
};

export const MailboxWaiver = () => {
  return (
    <p>
      This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
      responses to Requests for Additional Information (RAI) on Waivers, and
      extension requests on Waivers only. Any other correspondence will be
      disregarded.
    </p>
  );
};

export const ContactStateLead = (props: { isChip?: boolean }) => {
  return (
    <Section>
      <br />
      <p style={{ textAlign: "center" }}>
        If you have questions or did not expect this email, please contact{" "}
        {props.isChip ? (
          <a href="mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov">
            CHIPSPASubmissionMailBox@CMS.HHS.gov
          </a>
        ) : (
          <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a>
        )}{" "}
        or your state lead.
      </p>
      <p style={{ textAlign: "center" }}>Thank you!</p>
    </Section>
  );
};

export const SpamWarning = () => {
  return (
    <Section>
      <br />
      <p style={{ textAlign: "center" }}>
        If the contents of this email seem suspicious, do not open them, and
        instead forward this email to{" "}
        <a href="mailto:SPAM@cms.hhs.gov">SPAM@cms.hhs.gov</a>.
      </p>
      <p style={{ textAlign: "center" }}>Thank you!</p>
    </Section>
  );
};

export const WithdrawRAI = (props: {
  id: string;
  submitterName: string;
  submitterEmail: string;
}) => {
  return (
    <Section>
      <h3>
        The OneMAC Submission Portal received a request to withdraw the Formal
        RAI Response. You are receiving this email notification as the Formal
        RAI for {props.id} was withdrawn by {props.submitterName}{" "}
        {props.submitterEmail}.
      </h3>
    </Section>
  );
};

export const getCpocEmail = (item: any): string[] => {
  const cpocName = item._source.leadAnalystName;
  const cpocEmail = item._source.leadAnalystEmail;
  const email = [`${cpocName} <${cpocEmail}>`];
  return email ?? [];
};

export const getSrtEmails = (item: any): string[] => {
  const reviewTeam = item._source.reviewTeam;
  if (!reviewTeam) {
    return [];
  }
  return reviewTeam.map(
    (reviewer: any) => `${reviewer.name} <${reviewer.email}>`,
  );
};
