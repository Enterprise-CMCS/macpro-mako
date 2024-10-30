import {
  Text,
  Link,
  Section,
  Row,
  Column,
  Hr,
  Heading,
} from "@react-email/components";
import {
  Attachment,
  TextareaProps,
  AttachmentTitle,
  AttachmentKey,
} from "shared-types";
import { createRef, forwardRef } from "react";
import { styles } from "./email-styles";
// Constants
const EMAIL_CONFIG = {
  DEV_EMAIL: "mako.stateuser+dev-to@gmail.com",
  CHIP_EMAIL: "CHIPSPASubmissionMailBox@CMS.HHS.gov",
  SPA_EMAIL: "spa@cms.hhs.gov",
  SPAM_EMAIL: "SPAM@cms.hhs.gov",
} as const;

// Utility Types
interface EmailAddress {
  name: string;
  email: string;
}

interface AttachmentGroup {
  files?: Attachment[];
  label: string;
}

// Utility Functions
const getToAddress = ({ name, email }: EmailAddress): string[] => {
  const formattedEmail = `"${name}" <${
    process.env.isDev === "true" ? EMAIL_CONFIG.DEV_EMAIL : email
  }>`;
  return [formattedEmail];
};

const areAllAttachmentsEmpty = (
  attachments: Partial<Record<AttachmentTitle, AttachmentGroup | null>>,
): boolean => {
  if (!attachments) return true;
  return Object.values(attachments).every(
    (att) => !att || att.files?.length === 0,
  );
};

// Components
const Textarea: React.FC<TextareaProps> = ({ children }) => (
  <Text
    style={{
      width: "100%",
      backgroundColor: "transparent",
      fontSize: "14px",
      lineHeight: "1.4",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      outline: "none",
      whiteSpace: "pre-line",
      wordWrap: "break-word",
    }}
  >
    {children}
  </Text>
);

const LogoContainer = forwardRef<HTMLSpanElement, { url: string }>(
  ({ url }, ref) => (
    <header ref={ref} style={styles.logo.container}>
      <Link href={url} target="_blank" style={styles.logo.link}>
        <img
          height={40}
          width={112}
          style={{ maxWidth: "112px" }}
          src={`${url}onemac-logo.png`}
          alt="OneMAC Logo"
        />
      </Link>
    </header>
  ),
);

const EmailNav: React.FC<{ appEndpointUrl: string }> = ({ appEndpointUrl }) => (
  <Section>
    <LogoContainer ref={createRef()} url={appEndpointUrl} />
  </Section>
);

const LoginInstructions: React.FC<{ appEndpointURL: string }> = ({
  appEndpointURL,
}) => (
  <ul style={{ marginLeft: "-20px" }}>
    <li>
      <Text style={styles.text.description}>
        The submission can be acce.ssed in the OneMAC application at{" "}
        <Link href={appEndpointURL}>{appEndpointURL}</Link>
      </Text>
    </li>
    <li>
      <Text style={styles.text.description}>
        If not logged in, click "Login" at the top and use your Enterprise User
        Administration (EUA) credentials.
      </Text>
    </li>
    <li>
      <Text style={styles.text.description}>
        After logging in, you'll see the submission listed on the dashboard.
        Click its ID number to view details.
      </Text>
    </li>
  </ul>
);

const DetailsHeading: React.FC = () => (
  <div>
    <Hr style={styles.divider} />
    <Heading as="h2" style={styles.heading.h2}>
      Details:
    </Heading>
  </div>
);

const Attachments: React.FC<{
  attachments: Partial<Record<AttachmentKey, AttachmentGroup>>;
}> = ({ attachments }) => {
  if (!attachments || areAllAttachmentsEmpty(attachments)) {
    return <Text>No attachments</Text>;
  }

  return (
    <>
      <Hr style={styles.divider} />
      <Heading as="h2" style={styles.heading.h2}>
        Files:
      </Heading>

      {Object.entries(attachments).map(([key, group]) => {
        if (!group?.files?.length) return null;

        return (
          <Row key={key} style={{ marginBottom: "2px", marginTop: "2px" }}>
            <Column
              align="left"
              style={{
                width: "50%",
                verticalAlign: "top",
              }}
            >
              <Text style={{ ...styles.text.title }}>{group.label}:</Text>
            </Column>
            <Column style={{ verticalAlign: "top" }}>
              <Text style={styles.text.description}>
                {group.files.map((file, index) => (
                  <>
                    {file.filename}
                    {index < (group.files?.length ?? 0) - 1 && <br />}
                  </>
                ))}
              </Text>
            </Column>
          </Row>
        );
      })}
    </>
  );
};

const PackageDetails: React.FC<{
  details: Record<any, any>;
}> = ({ details }) => (
  <Section>
    {Object.entries(details).map(([label, value]) => {
      if (label === "Summary") {
        return (
          <Row key={label}>
            <Hr style={styles.divider} />
            <Text style={{ margin: ".5em" }}>
              <Heading as="h2" style={styles.heading.h2}>
                Summary:
              </Heading>
            </Text>
            <Textarea>
              {value ?? "No additional information submitted"}
            </Textarea>
          </Row>
        );
      }

      return (
        <Row key={label}>
          <Column align="left" style={{ width: "40%" }}>
            <Text style={styles.text.title}>{label}</Text>
          </Column>
          <Column>
            <Text style={styles.text.description}>{value ?? "Unknown"}</Text>
          </Column>
        </Row>
      );
    })}
  </Section>
);

const MailboxNotice: React.FC<{ type: "SPA" | "Waiver" }> = ({ type }) => (
  <Text style={styles.text.base}>
    {type === "SPA"
      ? "This mailbox is for the submittal of State Plan Amendments and non-web based responses to Requests for Additional Information (RAI) on submitted SPAs only."
      : "This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI) on Waivers, and extension requests on Waivers only."}
    {" Any other correspondence will be disregarded."}
  </Text>
);

const ContactStateLead: React.FC<{ isChip?: boolean }> = ({ isChip }) => (
  <Section
    style={{
      ...styles.section.footer,
      paddingLeft: "16px",
      paddingRight: "16px",
    }}
  >
    <Text style={{ fontSize: "14px" }}>
      If you have questions or did not expect this email, please contact{" "}
      <Link
        href={`mailto:${
          isChip ? EMAIL_CONFIG.CHIP_EMAIL : EMAIL_CONFIG.SPA_EMAIL
        }`}
        style={{ color: "#fff", textDecoration: "underline" }}
      >
        {isChip ? EMAIL_CONFIG.CHIP_EMAIL : EMAIL_CONFIG.SPA_EMAIL}
      </Link>{" "}
      or your state lead.
    </Text>
    <Text>Thank you!</Text>
  </Section>
);

export const EmailFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Section style={styles.section.footer}>{children}</Section>;

const BasicFooter: React.FC = () => (
  <EmailFooter>
    <Text style={styles.text.footer}>
      {`U.S. Centers for Medicare & Medicaid Services`}
    </Text>
    <Text style={styles.text.footer}>
      {`© ${new Date().getFullYear()} | 7500 Security Boulevard, Baltimore, MD 21244 | cms.gov`}
    </Text>
  </EmailFooter>
);

const WithdrawRAI: React.FC<{
  id: string;
  submitterName: string;
  submitterEmail: string;
}> = ({ id, submitterName, submitterEmail }) => (
  <Section>
    <Heading as="h2">
      The OneMAC Submission Portal received a request to withdraw the Formal RAI
      Response. You are receiving this email notification as the Formal RAI for{" "}
      {id} was withdrawn by {submitterName} {submitterEmail}.
    </Heading>
  </Section>
);

// Helper functions for getting emails
const getCpocEmail = (item: any): string[] => {
  const { leadAnalystName, leadAnalystEmail } = item._source;
  return [`${leadAnalystName} <${leadAnalystEmail}>`];
};

const getSrtEmails = (item: any): string[] => {
  const reviewTeam = item._source.reviewTeam;
  if (!reviewTeam) return [];

  return reviewTeam.map(
    (reviewer: any) => `${reviewer.name} <${reviewer.email}>`,
  );
};

export {
  Textarea,
  getToAddress,
  EmailNav,
  LoginInstructions,
  DetailsHeading,
  Attachments,
  PackageDetails,
  MailboxNotice,
  ContactStateLead,
  BasicFooter,
  WithdrawRAI,
  getCpocEmail,
  getSrtEmails,
};
