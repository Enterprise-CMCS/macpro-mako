import { Column, Heading, Hr, Link, Row, Section, Text } from "@react-email/components";
import { ReactNode } from "react";
import {
  Attachment,
  AttachmentKey,
  CommonEmailVariables,
  EmailAddresses,
  Events,
} from "shared-types";
import { styles } from "./email-styles";
import * as os from "shared-types/opensearch";
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
  attachments: Partial<Record<string, { label: string; files?: any[] }>>,
): boolean => {
  return Object.values(attachments).every((att) => !att || !att.files || att.files.length === 0);
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

        return group.files.map((file, index) => (
          <Row key={key} style={{ marginBottom: "2px", marginTop: "2px" }}>
            <Column
              align="left"
              style={{
                width: "50%",
                verticalAlign: "top",
              }}
            >
              {" "}
              <span key={group.label + index}>
                <Text style={{ ...styles.text.title }}>{group.label}:</Text>{" "}
              </span>
            </Column>
            <Column style={{ verticalAlign: "top" }}>
              <Text style={styles.text.description}>
                <span key={file.filename + index}>{file.filename}</span>
              </Text>
            </Column>
          </Row>
        ));
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
            <Text
              style={{
                whiteSpace: "pre-line",
              }}
            >
              {value ?? "No additional information submitted"}
            </Text>
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

const MailboxNotice = ({
  type,
  onWaivers = true,
}: {
  type: "SPA" | "Waiver";
  onWaivers?: boolean;
}) => (
  <Text style={{ ...styles.text.description, marginTop: "16px", marginBottom: "16px" }}>
    {type === "SPA"
      ? "This mailbox is for the submittal of State Plan Amendments and non-web based responses to Requests for Additional Information (RAI) on submitted SPAs only."
      : `This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI)${onWaivers ? " on Waivers" : ""}, and extension requests on Waivers only.`}
    {" Any other correspondence will be disregarded."}
  </Text>
);

const FollowUpNotice = ({
  isChip,
  includeStateLead = true,
  includeDidNotExpect = true,
  withDivider = true,
}: {
  isChip?: boolean;
  includeStateLead?: boolean;
  includeDidNotExpect?: boolean;
  withDivider?: boolean;
}) => (
  <>
    {withDivider && <Divider />}
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
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
}

const getCpocEmail = (item?: os.main.ItemResult): string[] => {
  try {
    const email = item?._source?.leadAnalystEmail;
    const name = item?._source?.leadAnalystName;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      console.error(`Invalid or missing email for item: ${JSON.stringify(item?._source, null, 2)}`);
      return [];
    }

    return [`${name} <${email}>`];
  } catch (e) {
    console.error("Error getting CPOC email", e);
    return [];
  }
};

const getSrtEmails = (item?: os.main.ItemResult): string[] => {
  try {
    const reviewTeam = item?._source?.reviewTeam;

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!reviewTeam || reviewTeam.length === 0) {
      return [];
    }

    return reviewTeam
      .map((reviewer: { name: string; email: string }) => {
        const { name, email } = reviewer;

        if (!email || !emailRegex.test(email)) {
          console.error(
            `Invalid or missing email for reviewer: ${JSON.stringify(reviewer, null, 2)}`,
          );
          return null;
        }

        return `${name} <${email}>`;
      })
      .filter((email): email is string => email !== null);
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
  EmailFooter,
  getCpocEmail,
  getSrtEmails,
  areAllAttachmentsEmpty,
};
