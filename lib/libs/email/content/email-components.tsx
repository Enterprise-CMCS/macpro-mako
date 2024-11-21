import { Text, Link, Section, Row, Column, Hr, Heading } from "@react-email/components";
import { Attachment, AttachmentTitle, AttachmentKey } from "shared-types";
import { createRef, forwardRef } from "react";
import { styles } from "./email-styles";

export const EMAIL_CONFIG = {
  DEV_EMAIL: "mako.stateuser+dev-to@gmail.com",
  CHIP_EMAIL: "CHIPSPASubmissionMailBox@cms.hhs.gov",
  SPA_EMAIL: "spa@cms.hhs.gov",
  SPAM_EMAIL: "SPAM@cms.hhs.gov",
} as const;
export interface EmailAddress {
  name: string;
  email: string;
}

interface AttachmentGroup {
  files?: Attachment[];
  label: string;
}

const areAllAttachmentsEmpty = (
  attachments: Partial<Record<AttachmentTitle, AttachmentGroup | null>>,
): boolean => {
  if (!attachments) return true;
  return Object.values(attachments).every((att) => !att || att.files?.length === 0);
};

const Textarea = ({ children }: { children: React.ReactNode }) => (
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

const LogoContainer = forwardRef<HTMLSpanElement, { url: string }>(({ url }, ref) => (
  <header ref={ref} style={styles.logo.container}>
    <Link href={url} target="_blank" style={styles.logo.link}>
      <img
        height={40}
        width={112}
        style={{ maxWidth: "112px" }}
        src={`${url}onemac-logo.png`}
        alt="OneMAC Logo"
      />
      <img alt="" />
    </Link>
  </header>
));

const EmailNav = ({ appEndpointUrl }: { appEndpointUrl: string }) => (
  <Section>
    <LogoContainer ref={createRef()} url={appEndpointUrl} />
  </Section>
);

const LoginInstructions = ({
  appEndpointURL,
  useThisLink,
}: {
  appEndpointURL: string;
  useThisLink?: boolean;
}) => (
  <ul style={{ marginLeft: "-20px" }}>
    <li>
      <Text style={styles.text.description}>
        The submission can be accessed in the OneMAC application at{" "}
        <Link href={appEndpointURL}>{useThisLink ? "this link" : appEndpointURL}</Link>.
      </Text>
    </li>
    <li>
      <Text style={styles.text.description}>
        If you are not already logged in, please click the "Login" link at the top of the page and
        log in using your Enterprise User Administration (EUA) credentials.
      </Text>
    </li>
    <li>
      <Text style={styles.text.description}>
        After you have logged in, you will be taken to the OneMAC application. The submission will
        be listed on the dashboard page, and you can view its details by clicking on its ID number.
      </Text>
    </li>
  </ul>
);

const DetailsHeading = () => (
  <div>
    <Hr style={styles.divider} />
    <Heading as="h2" style={styles.heading.h2}>
      Details:
    </Heading>
  </div>
);

const Attachments = ({
  attachments,
}: {
  attachments: Partial<Record<AttachmentKey, AttachmentGroup>>;
}) => {
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
                  <span key={file.filename + index}>
                    {file.filename}
                    {index < (group.files?.length ?? 0) - 1 && <br />}
                  </span>
                ))}
              </Text>
            </Column>
          </Row>
        );
      })}
    </>
  );
};

const PackageDetails = ({ details }: { details: Record<any, any> }) => (
  <Section>
    {Object.entries(details).map(([label, value], index) => {
      if (label === "Summary") {
        return (
          <Row key={label + index}>
            <Hr style={styles.divider} />
            <Text style={{ margin: ".5em" }}>
              <Heading as="h2" style={styles.heading.h2}>
                Summary:
              </Heading>
            </Text>
            <Textarea>{value ?? "No additional information submitted"}</Textarea>
          </Row>
        );
      }

      return (
        <Row key={label + index}>
          <Column align="left" style={{ width: "50%" }}>
            <Text style={styles.text.title}>{label}</Text>
          </Column>
          <Column>
            <Text style={styles.text.description}>{value ?? "Not provided"}</Text>
          </Column>
        </Row>
      );
    })}
  </Section>
);

const MailboxNotice = ({ type }: { type: "SPA" | "Waiver" }) => (
  <Text style={{ ...styles.text.description, marginTop: "16px", marginBottom: "16px" }}>
    {type === "SPA"
      ? "This mailbox is for the submittal of State Plan Amendments and non-web based responses to Requests for Additional Information (RAI) on submitted SPAs only."
      : "This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI) on Waivers, and extension requests on Waivers only."}
    {" Any other correspondence will be disregarded."}
  </Text>
);

const ContactStateLead = ({ isChip }: { isChip?: boolean }) => (
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
        href={`mailto:${isChip ? EMAIL_CONFIG.CHIP_EMAIL : EMAIL_CONFIG.SPA_EMAIL}`}
        style={{ color: "#fff", textDecoration: "underline" }}
      >
        {isChip ? EMAIL_CONFIG.CHIP_EMAIL : EMAIL_CONFIG.SPA_EMAIL}
      </Link>{" "}
      or your state lead.
    </Text>
    <Text>Thank you!</Text>
  </Section>
);

const EmailFooter = ({ children }: { children: React.ReactNode }) => (
  <Section style={styles.section.footer}>{children}</Section>
);

const BasicFooter = () => (
  <EmailFooter>
    <Text
      style={{ ...styles.text.footer, margin: "8px" }}
    >{`U.S. Centers for Medicare & Medicaid Services`}</Text>
    <Text style={{ ...styles.text.footer, margin: "8px" }}>
      © {new Date().getFullYear()} | 7500 Security Boulevard, Baltimore, MD 21244
    </Text>
  </EmailFooter>
);

const WithdrawRAI = ({
  id,
  submitterName,
  submitterEmail,
}: {
  id: string;
  submitterName: string;
  submitterEmail: string;
}) => (
  <Section>
    <Heading as="h2">
      The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are
      receiving this email notification as the Formal RAI for {id} was withdrawn by {submitterName}{" "}
      {submitterEmail}.
    </Heading>
  </Section>
);

const getCpocEmail = (item: any): string[] => {
  try {
    const { leadAnalystName, leadAnalystEmail } = item._source;
    return [`${leadAnalystName} <${leadAnalystEmail}>`];
  } catch (e) {
    console.error("Error getting CPCO email", e);
    return [];
  }
};

const getSrtEmails = (item: any): string[] => {
  try {
    const reviewTeam = item._source.reviewTeam;
    if (!reviewTeam) return [];

    return reviewTeam.map((reviewer: any) => `${reviewer.name} <${reviewer.email}>`);
  } catch (e) {
    console.error("Error getting SRT emails", e);
    return [];
  }
};

export {
  Textarea,
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
  EmailFooter,
};
