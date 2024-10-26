import {
  Text,
  Link,
  Section,
  Row,
  Column,
  Hr,
  Heading,
} from "@react-email/components";
import { Attachment, TextareaProps } from "shared-types";
import { createRef, forwardRef } from "react";
type AttachmentsType = {
  [key: string]: { files?: Attachment[]; label: string };
};

export const Textarea: React.FC<TextareaProps> = ({
  children,
}: TextareaProps) => {
  return (
    <Text
      style={{
        width: "100%",
        backgroundColor: "transparent",
        fontSize: "14px",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        outline: "none",
        whiteSpace: "pre-line",
        wordWrap: "break-word",
      }}
    >
      {children}
    </Text>
  );
};

export const getToAddress = ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  if (process.env.isDev === "true") {
    return [`"${name}" <mako.stateuser+dev-to@gmail.com>`];
  }

  return [`"${name}" <${email}>`];
};

const LogoContainer = forwardRef<HTMLSpanElement, { url: string }>(
  ({ url }, ref) => {
    return (
      <header ref={ref} style={{ backgroundColor: "#0071BD", padding: "16px" }}>
        <Link
          href={url}
          target="_blank"
          style={{ display: "block", maxWidth: "112px" }}
        >
          <img
            height={40}
            width={112}
            style={{ maxWidth: "112px" }}
            src={`${url}/assets/onemac-logo-BdXmNUXn.png`}
            alt="OneMAC Logo"
          />
        </Link>
      </header>
    );
  },
);

export const EmailNav = (props: { appEndpointUrl: string }) => {
  const ref = createRef<HTMLSpanElement>();
  return (
    <Section>
      <LogoContainer ref={ref} url={props.appEndpointUrl} />
    </Section>
  );
};

export const LoginInstructions = (props: { appEndpointURL: string }) => {
  return (
    <ul style={{ marginLeft: "-20px" }}>
      <li>
        <Text>
          The submission can be accessed in the OneMAC application, which you
          can find at{" "}
          <Link href={props.appEndpointURL}>{props.appEndpointURL}</Link>
        </Text>
      </li>
      <li>
        <Text>
          If you are not already logged in, please click the "Login" link at the
          top of the page and log in using your Enterprise User Administration
          (EUA) credentials.
        </Text>
      </li>
      <li>
        <Text>
          After you have logged in, you will be taken to the OneMAC application.
          The submission will be listed on the dashboard page, and you can view
          its details by clicking on its ID number.
        </Text>
      </li>
    </ul>
  );
};

export const DetailsHeading = () => {
  return (
    <div>
      <Hr style={styles.divider} />
      <Heading as="h2" style={{ fontSize: "16px" }}>
        Details:
      </Heading>
    </div>
  );
};

export const Attachments = (props: { attachments: AttachmentsType }) => {
  //check if empty
  const areAllAttachmentsEmpty = (attachments: AttachmentsType): boolean => {
    return Object.values(attachments).every(
      ({ files }) => !files || files.length === 0,
    );
  };

  // return if empty
  if (areAllAttachmentsEmpty(props.attachments)) {
    return <Text>No attachments</Text>;
  }

  // used in loop
  const attachmentKeys = Object.keys(props.attachments);
  // creating a string list of all the attachment filenames in the array
  const createAttachementList = (files: Attachment[]) => {
    let fileString: string = "";
    let i = 0;
    for (i = 0; i <= files.length - 2; i++) {
      fileString += files[i].filename + ", ";
    }
    fileString += files[i].filename;
    return fileString;
  };

  return (
    <>
      <Hr style={styles.divider} />
      <Heading as="h2" style={{ fontSize: "16px" }}>
        Files:
      </Heading>

      {attachmentKeys?.map(
        (key: keyof typeof props.attachments, idx: number) => {
          if (!props.attachments[key].files) return;
          const title = props.attachments[key].label;
          const filenames = createAttachementList(props.attachments[key].files);
          return (
            <Row key={key + String(idx)}>
              <Column align="left" style={{ width: "50%", paddingTop: "8px" }}>
                <Text style={textTitle}>{title}</Text>
              </Column>
              <Column>
                <Text style={{ ...textDescription, paddingTop: "8px" }}>
                  {filenames}
                </Text>
              </Column>
            </Row>
          );
        },
      )}
    </>
  );
};

export const PackageDetails = (props: {
  details: { [key: string]: string | null | undefined };
  attachments?: AttachmentsType | null;
}) => {
  return (
    <Section>
      {Object.keys(props.details).map((label: string, idx: number) => {
        if (label === "Summary") {
          const summary =
            props.details[label] ?? "No additional information submitted";
          return (
            <Row>
              <Hr style={styles.divider} />
              <Text style={{ margin: ".5em" }}>
                <Heading as="h2" style={{ fontSize: "16px" }}>
                  Summary:
                </Heading>
              </Text>
              <Textarea>{summary}</Textarea>
            </Row>
          );
        }
        return (
          <Row key={label + idx}>
            <Column align="left" style={{ width: "50%", paddingTop: "8px" }}>
              <Text style={textTitle}>{label}</Text>
            </Column>
            <Column>
              <Text style={{ ...textDescription, paddingTop: "8px" }}>
                {props.details[label] ?? "Unknown"}
              </Text>
            </Column>
          </Row>
        );
      })}
      {props.attachments && <Attachments attachments={props.attachments} />}
    </Section>
  );
};

export const MailboxSPA = () => {
  return (
    <Text style={styles.text}>
      This mailbox is for the submittal of State Plan Amendments and non-web
      based responses to Requests for Additional Information (RAI) on submitted
      SPAs only. Any other correspondence will be disregarded.
    </Text>
  );
};

export const MailboxWaiver = () => {
  return (
    <Text style={styles.text}>
      This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
      responses to Requests for Additional Information (RAI) on Waivers, and
      extension requests on Waivers only. Any other correspondence will be
      disregarded.
    </Text>
  );
};

export const ContactStateLead = (props: { isChip?: boolean }) => {
  return (
    <Section style={styles.footer}>
      <Text style={{ fontSize: "14px" }}>
        If you have questions or did not expect this email, please contact{" "}
        {props.isChip ? (
          <Link
            href="mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            CHIPSPASubmissionMailBox@CMS.HHS.gov
          </Link>
        ) : (
          <Link
            href="mailto:spa@cms.hhs.gov"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            spa@cms.hhs.gov
          </Link>
        )}{" "}
        or your state lead.
      </Text>
      <Text>Thank you!</Text>
    </Section>
  );
};

export const SpamWarning = () => {
  return (
    <Section style={styles.footer}>
      <Text style={{ fontSize: "14px" }}>
        If the contents of this email seem suspicious, do not open them, and
        instead forward this email to{" "}
        <a
          href="mailto:SPAM@cms.hhs.gov"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          SPAM@cms.hhs.gov
        </a>
        .
      </Text>
      <Text>Thank you!</Text>
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
      <Heading as="h2">
        The OneMAC Submission Portal received a request to withdraw the Formal
        RAI Response. You are receiving this email notification as the Formal
        RAI for {props.id} was withdrawn by {props.submitterName}{" "}
        {props.submitterEmail}.
      </Heading>
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

const resetText = {
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const main = {
  backgroundColor: "#fff",
  color: "#212121",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  ...resetText,
};

const container = {
  backgroundColor: "#F5F5F5",
};

const textTitle = {
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "-0.5px",
  ...resetText,
};

const textDescription = {
  fontSize: "14px",
  color: "#333",
  ...resetText,
};

const h1 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const text = {
  color: "#333",
  fontSize: "14px",
  margin: "12px 0",
};

const primarySection = { margin: "8px", padding: "8px" };

const footer = {
  fontSize: "14px",
  padding: "0 24px",
  fontWeight: "300",
  backgroundColor: "#0071BD",
  color: "#fff",
  textAlign: "center" as const,
};

const divider = { margin: "16px 0", borderTop: "2px solid #0071BD" };

export const styles = {
  divider,
  main,
  container,
  h1,
  footer,
  textTitle,
  textDescription,
  text,
  primarySection,
};
