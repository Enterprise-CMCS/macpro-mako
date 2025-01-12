import { Column, Heading, Hr, Link, Row, Section, Text } from "@react-email/components";
import { ReactNode } from "react";
import { Attachment, AttachmentKey, AttachmentTitle, Events } from "shared-types";
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

const Divider = () => <Hr style={styles.divider} />;

const Textarea = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      width: "100%",
      backgroundColor: "transparent",
      fontSize: "14px",
      lineHeight: "1.4",
      outline: "none",
      whiteSpace: "pre-line",
      wordWrap: "break-word",
    }}
  >
    {children}
  </Text>
);

const EmailNav = ({ appEndpointUrl }: { appEndpointUrl: string }) => (
  <Section style={styles.logo.container}>
    <Link href={appEndpointUrl} target="_blank" style={styles.logo.link}>
      <img
        height={40}
        width={112}
        style={{ maxWidth: "112px" }}
        src={`${appEndpointUrl}onemac-logo.png`}
        alt="OneMAC Logo"
      />
    </Link>
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
        The submission can be accessed in the OneMAC application, which you can find at{" "}
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

const SubDocHowToAccess = ({
  appEndpointURL,
}: {
  appEndpointURL: string;
  useThisLink?: boolean;
}) => (
  <>
    <Divider />
    <Text style={{ ...styles.text.base, fontWeight: "bold" }}>How to Access:</Text>
    <ul>
      <li>
        <Text style={styles.text.description}>
          These documents can be found in OneMAC through this link{" "}
          <Link href={appEndpointURL}>{appEndpointURL}</Link>.
        </Text>
      </li>
      <li>
        <Text style={styles.text.description}>
          If you are not already logged in, click “Login” at the top of the page and log in using
          your Enterprise User Administration (EUA) credentials.
        </Text>
      </li>

      <li>
        <Text style={styles.text.description}>
          After you logged in, click the submission ID number on the dashboard page to view details.
        </Text>
      </li>
    </ul>
  </>
);

const DetailsHeading = () => (
  <div>
    <Divider />
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
      <Divider />
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
              {group.files.map((file, index) => (
                <span key={file.filename + index}>
                  <Text style={{ ...styles.text.title }}>{group.label}:</Text>{" "}
                  {index < (group.files?.length ?? 0) - 1 && <br />}
                </span>
              ))}
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

const PackageDetails = ({ details }: { details: Record<string, ReactNode> }) => (
  <Section>
    {Object.entries(details).map(([label, value], index) => {
      if (label === "Summary") {
        return (
          <Row key={label + index}>
            <Divider />
            <Text style={{ margin: ".5em" }}>
              <Heading as="h2" style={styles.heading.h2}>
                Summary:
              </Heading>
            </Text>
            <Text>{value ?? "No additional information submitted"}</Text>
          </Row>
        );
      }

      return (
        <Row key={label + index}>
          <Column align="left" style={{ width: "50%" }}>
            <Text style={styles.text.title}>{label}:</Text>
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

const FollowUpNotice = ({
  isChip,
  includeStateLead = true,
  includeDidNotExpect = true,
}: {
  isChip?: boolean;
  includeStateLead?: boolean;
  includeDidNotExpect?: boolean;
}) => (
  <>
    <Divider />
    {isChip ? (
      <Section>
        <Text style={{ marginTop: "8px", fontSize: "14px" }}>
          If you have any questions, please contact{" "}
          <Link href={`mailto:${EMAIL_CONFIG.CHIP_EMAIL}`} style={{ textDecoration: "underline" }}>
            {EMAIL_CONFIG.CHIP_EMAIL}
          </Link>
          {includeStateLead ? " or your state lead." : "."}
        </Text>
      </Section>
    ) : (
      <Section>
        <Text style={{ marginTop: "8px", fontSize: "14px" }}>
          {`If you have any questions${
            includeDidNotExpect ? " or did not expect this email" : ""
          }, please contact `}
          <Link href={`mailto:${EMAIL_CONFIG.SPA_EMAIL}`} style={{ textDecoration: "underline" }}>
            {EMAIL_CONFIG.SPA_EMAIL}
          </Link>
          {includeStateLead ? " or your state lead." : "."}
        </Text>
      </Section>
    )}
  </>
);

const EmailFooter = ({ children }: { children: React.ReactNode }) => (
  <Section style={styles.section.footer}>{children}</Section>
);

const BasicFooter = () => (
  <EmailFooter>
    <Text style={{ ...styles.text.footer, margin: "8px" }}>
      U.S. Centers for Medicare & Medicaid Services
    </Text>
    <Text style={{ ...styles.text.footer, margin: "8px" }}>
      © {new Date().getFullYear()} | 7500 Security Boulevard, Baltimore, MD 21244
    </Text>
  </EmailFooter>
);

export interface WithdrawRAIProps {
  relatedEvent: Events[keyof Events] | null;
  id: string;
}

const WithdrawRAI: React.FC<WithdrawRAIProps> = ({ id, relatedEvent }) => {
  const submitterInfo =
    relatedEvent?.event === "respond-to-rai"
      ? relatedEvent
      : relatedEvent?.submitterName && relatedEvent?.submitterEmail
      ? relatedEvent
      : null;

  return (
    <Section>
      <Heading as="h2">
        {`The OneMAC Submission Portal received a request to withdraw the Formal RAI Response ${id}. ${
          submitterInfo
            ? `You are receiving this email notification as the Formal RAI for ${id} was withdrawn by ${submitterInfo.submitterName} ${submitterInfo.submitterEmail}.`
            : ""
        }`}
      </Heading>
    </Section>
  );
};

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
  SubDocHowToAccess,
  DetailsHeading,
  Divider,
  Attachments,
  PackageDetails,
  MailboxNotice,
  FollowUpNotice,
  BasicFooter,
  WithdrawRAI,
  getCpocEmail,
  getSrtEmails,
  EmailFooter,
};
