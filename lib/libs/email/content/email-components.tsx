import { Text, Link, Section, Row, Column, Hr, Heading } from "@react-email/components";
import { Attachment, TextareaProps, AttachmentTitle, AttachmentKey } from "shared-types";
import { createRef, forwardRef } from "react";
import { styles } from "./email-styles";
// Constants
const EMAIL_CONFIG = {
  DEV_EMAIL: "mako.stateuser+dev-to@gmail.com",
  CHIP_EMAIL: "CHIPSPASubmissionMailBox@cms.hhs.gov",
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
  return Object.values(attachments).every((att) => !att || att.files?.length === 0);
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

const LogoContainer = forwardRef<HTMLSpanElement, { url: string }>(({ url }, ref) => (
  <header ref={ref} style={styles.logo.container}>
    <Link href={url} target="_blank" style={styles.logo.link}>
      <img
        height={40}
        width={112}
        style={{ maxWidth: "112px" }}
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTExIiBoZWlnaHQ9IjQyIiB2aWV3Qm94PSIwIDAgMTExIDQyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNjMuNTI5MyAxMC4wNTIyQzYzLjUyOTMgMTEuNDExMyA2My4zNjI1IDEyLjY1MjMgNjMuMDI4OCAxMy43NzU0QzYyLjY5NTEgMTQuODk4NCA2Mi4xOTQ3IDE1Ljg2NjkgNjEuNTI3MyAxNi42ODA3QzYwLjg2IDE3LjQ5NDUgNjAuMDI1OSAxOC4xMjUyIDU5LjAyNDkgMTguNTcyOEM1OC4wMzIxIDE5LjAyMDMgNTYuODcyNCAxOS4yNDQxIDU1LjU0NTkgMTkuMjQ0MUM1NC4yMTEzIDE5LjI0NDEgNTMuMDQzNSAxOS4wMjAzIDUyLjA0MjUgMTguNTcyOEM1MS4wNDE1IDE4LjEyNTIgNTAuMjA3NCAxNy40OTQ1IDQ5LjU0IDE2LjY4MDdDNDguODgwOSAxNS44NTg3IDQ4LjM4NDQgMTQuODg2MiA0OC4wNTA4IDEzLjc2MzJDNDcuNzE3MSAxMi42MzIgNDcuNTUwMyAxMS4zODY5IDQ3LjU1MDMgMTAuMDI3OEM0Ny41NTAzIDguMjIxMTkgNDcuODU1NSA2LjYzMDIxIDQ4LjQ2NTggNS4yNTQ4OEM0OS4wODQzIDMuODc5NTYgNDkuOTkxNyAyLjgwNTM0IDUxLjE4OCAyLjAzMjIzQzUyLjM5MjQgMS4yNTkxMSA1My44Nzc2IDAuODcyNTU5IDU1LjY0MzYgMC44NzI1NTlDNTcuMzM2MyAwLjg3MjU1OSA1OC43Njg2IDEuMjQyODQgNTkuOTQwNCAxLjk4MzRDNjEuMTIwNCAyLjcxNTgyIDYyLjAxMTYgMy43Njk2OSA2Mi42MTM4IDUuMTQ1MDJDNjMuMjI0MSA2LjUxMjIxIDYzLjUyOTMgOC4xNDc5NSA2My41MjkzIDEwLjA1MjJaTTQ4Ljg2ODcgMTAuMDRDNDguODY4NyAxMS42MzUxIDQ5LjEwODcgMTMuMDQzIDQ5LjU4ODkgMTQuMjYzN0M1MC4wNjkgMTUuNDc2MiA1MC44MDU1IDE2LjQyNDMgNTEuNzk4MyAxNy4xMDc5QzUyLjc5MTIgMTcuNzkxNSA1NC4wNDQ0IDE4LjEzMzMgNTUuNTU4MSAxOC4xMzMzQzU3LjA4ODEgMTguMTMzMyA1OC4zNDU0IDE3Ljc5NTYgNTkuMzMwMSAxNy4xMjAxQzYwLjMxNDggMTYuNDQ0NyA2MS4wNDMxIDE1LjUwMDcgNjEuNTE1MSAxNC4yODgxQzYxLjk4NzEgMTMuMDc1NSA2Mi4yMjMxIDExLjY2MzYgNjIuMjIzMSAxMC4wNTIyQzYyLjIyMzEgNy41MDUwNSA2MS42NjU3IDUuNTI3NTEgNjAuNTUwOCA0LjExOTYzQzU5LjQ0NCAyLjcxMTc1IDU3LjgwODMgMi4wMDc4MSA1NS42NDM2IDIuMDA3ODFDNTQuMTIxNyAyLjAwNzgxIDUyLjg1NjMgMi4zNDU1NCA1MS44NDcyIDMuMDIxQzUwLjg0NjIgMy42OTY0NSA1MC4wOTc1IDQuNjM2MzkgNDkuNjAxMSA1Ljg0MDgyQzQ5LjExMjggNy4wNDUyNSA0OC44Njg3IDguNDQ0OTkgNDguODY4NyAxMC4wNFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik03My40MTA2IDUuNDc0NjFDNzQuODk5OSA1LjQ3NDYxIDc2LjA0MzMgNS44NjUyMyA3Ni44NDA4IDYuNjQ2NDhDNzcuNjM4MyA3LjQyNzczIDc4LjAzNzEgOC42NTI1MSA3OC4wMzcxIDEwLjMyMDhWMTlINzYuODE2NFYxMC4zOTRDNzYuODE2NCA5LjA3NTY4IDc2LjUxNTMgOC4xMDcyNiA3NS45MTMxIDcuNDg4NzdDNzUuMzEwOSA2Ljg3MDI4IDc0LjQzNiA2LjU2MTA0IDczLjI4ODYgNi41NjEwNEM3MS44MzE5IDYuNTYxMDQgNzAuNzE3IDYuOTg4MjggNjkuOTQzOCA3Ljg0Mjc3QzY5LjE3ODkgOC42ODkxMyA2OC43OTY0IDkuOTcwODcgNjguNzk2NCAxMS42ODhWMTlINjcuNTYzNVY1LjczMDk2SDY4LjU2NDVMNjguNzQ3NiA4LjE0Nzk1SDY4LjgyMDhDNjkuMDU2OCA3LjY1MTUzIDY5LjM3ODMgNy4yMDM5NCA2OS43ODUyIDYuODA1MThDNzAuMjAwMiA2LjM5ODI3IDcwLjcwODggNi4wNzY4MiA3MS4zMTEgNS44NDA4MkM3MS45MTMyIDUuNTk2NjggNzIuNjEzMSA1LjQ3NDYxIDczLjQxMDYgNS40NzQ2MVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04Ny42MTMzIDUuNDc0NjFDODguNzQ0NSA1LjQ3NDYxIDg5LjY4NDQgNS43MzkxIDkwLjQzMzEgNi4yNjgwN0M5MS4xODk5IDYuNzk3MDQgOTEuNzUxNSA3LjUyMTMyIDkyLjExNzcgOC40NDA5MkM5Mi40OTIgOS4zNjA1MSA5Mi42NzkyIDEwLjQxNDQgOTIuNjc5MiAxMS42MDI1VjEyLjQ5MzdIODMuMDk2N0M4My4wOTY3IDE0LjMxNjYgODMuNTE1OCAxNS43MTYzIDg0LjM1NCAxNi42OTI5Qzg1LjIwMDQgMTcuNjY5NCA4Ni40MDg5IDE4LjE1NzcgODcuOTc5NSAxOC4xNTc3Qzg4LjgwMTQgMTguMTU3NyA4OS41MTM1IDE4LjA5MjYgOTAuMTE1NyAxNy45NjI0QzkwLjcyNjEgMTcuODI0MSA5MS40MDE1IDE3LjU5MjEgOTIuMTQyMSAxNy4yNjY2VjE4LjQwMTlDOTEuNDkxIDE4LjY5NDggOTAuODQgMTguOTA2NCA5MC4xODkgMTkuMDM2NkM4OS41Mzc5IDE5LjE3NSA4OC43ODkyIDE5LjI0NDEgODcuOTQyOSAxOS4yNDQxQzg2LjYwMDEgMTkuMjQ0MSA4NS40NzMgMTguOTY3NCA4NC41NjE1IDE4LjQxNDFDODMuNjU4MiAxNy44NTI1IDgyLjk3NDYgMTcuMDYzMiA4Mi41MTA3IDE2LjA0NTlDODIuMDU1IDE1LjAyODYgODEuODI3MSAxMy44NDA1IDgxLjgyNzEgMTIuNDgxNEM4MS44MjcxIDExLjE1NDkgODIuMDQ2OSA5Ljk2MjczIDgyLjQ4NjMgOC45MDQ3OUM4Mi45MzM5IDcuODQ2ODQgODMuNTg1IDcuMDEyNyA4NC40Mzk1IDYuNDAyMzRDODUuMzAyMSA1Ljc4Mzg1IDg2LjM2IDUuNDc0NjEgODcuNjEzMyA1LjQ3NDYxWk04Ny42MDExIDYuNTM2NjJDODYuMzMxNSA2LjUzNjYyIDg1LjMwMjEgNi45NTk4IDg0LjUxMjcgNy44MDYxNUM4My43MzE0IDguNjQ0MzcgODMuMjcxNiA5Ljg1NjkzIDgzLjEzMzMgMTEuNDQzOEg5MS4zOTc1QzkxLjM5NzUgMTAuNDc1NCA5MS4yNTkxIDkuNjIwOTMgOTAuOTgyNCA4Ljg4MDM3QzkwLjcwNTcgOC4xMzk4MSA5MC4yODY2IDcuNTY2MDggODkuNzI1MSA3LjE1OTE4Qzg5LjE3MTcgNi43NDQxNCA4OC40NjM3IDYuNTM2NjIgODcuNjAxMSA2LjUzNjYyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTU2LjA5MjggNDFMNTIuMjk2OSAyNy42MzE4SDUyLjE4MjZDNTIuMjE2NSAyNy45Nzg4IDUyLjI1MDMgMjguNDQ4NiA1Mi4yODQyIDI5LjA0MUM1Mi4zMjY1IDI5LjYzMzUgNTIuMzY0NiAzMC4yNzI1IDUyLjM5ODQgMzAuOTU4QzUyLjQzMjMgMzEuNjQzNiA1Mi40NDkyIDMyLjMwMzcgNTIuNDQ5MiAzMi45Mzg1VjQxSDQ4LjAwNTlWMjIuNDM5NUg1NC42ODM2TDU4LjU1NTcgMzUuNjE3Mkg1OC42NTcyTDYyLjQ1MzEgMjIuNDM5NUg2OS4xNDM2VjQxSDY0LjUzNTJWMzIuODYyM0M2NC41MzUyIDMyLjI3ODMgNjQuNTQzNiAzMS42NTIgNjQuNTYwNSAzMC45ODM0QzY0LjU4NTkgMzAuMzA2MyA2NC42MTEzIDI5LjY3MTUgNjQuNjM2NyAyOS4wNzkxQzY0LjY3MDYgMjguNDc4MiA2NC43MDAyIDI4LjAwNDIgNjQuNzI1NiAyNy42NTcySDY0LjYxMTNMNjAuODY2MiA0MUg1Ni4wOTI4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTg0LjE0MDMgNDFMODMuMjI2MiAzNy41MjE1SDc3LjE5NTlMNzYuMjU2NSA0MUg3MC43NDY3TDc2LjgwMjQgMjIuMzYzM0g4My40OTI4TDg5LjYyNDYgNDFIODQuMTQwM1pNODIuMTg1MiAzMy40MDgyTDgxLjM4NTQgMzAuMzYxM0M4MS4zMDA4IDMwLjAzMTIgODEuMTc4IDI5LjU2MTUgODEuMDE3MiAyOC45NTIxQzgwLjg1NjQgMjguMzM0MyA4MC42OTU2IDI3LjY5OTUgODAuNTM0OCAyNy4wNDc5QzgwLjM4MjUgMjYuMzg3NyA4MC4yNjQgMjUuODQ2IDgwLjE3OTMgMjUuNDIyOUM4MC4xMDMyIDI1Ljg0NiA3OS45OTMxIDI2LjM3MDggNzkuODQ5MyAyNi45OTcxQzc5LjcxMzggMjcuNjE0OSA3OS41NyAyOC4yMjg1IDc5LjQxNzYgMjguODM3OUM3OS4yNzM3IDI5LjQ0NzMgNzkuMTQ2OCAyOS45NTUxIDc5LjAzNjggMzAuMzYxM0w3OC4yMzcgMzMuNDA4Mkg4Mi4xODUyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTk5LjUxNzkgMjYuMjg2MUM5OC45MjU0IDI2LjI4NjEgOTguMzk2NCAyNi40MTMxIDk3LjkzMDkgMjYuNjY3Qzk3LjQ2NTQgMjYuOTEyNCA5Ny4wNjc3IDI3LjI3MjEgOTYuNzM3NiAyNy43NDYxQzk2LjQwNzUgMjguMjIwMSA5Ni4xNTM2IDI4Ljc5OTggOTUuOTc1OSAyOS40ODU0Qzk1LjgwNjYgMzAuMTYyNCA5NS43MjIgMzAuOTMyNiA5NS43MjIgMzEuNzk1OUM5NS43MjIgMzIuOTYzOSA5NS44NzAxIDMzLjk0NTYgOTYuMTY2MyAzNC43NDEyQzk2LjQ2MjUgMzUuNTM2OCA5Ni45MTExIDM2LjEzNzcgOTcuNTEyIDM2LjU0MzlDOTguMTIxNCAzNi45NTAyIDk4Ljg4MzEgMzcuMTUzMyA5OS43OTcxIDM3LjE1MzNDMTAwLjYyNyAzNy4xNTMzIDEwMS40MjIgMzcuMDM5MSAxMDIuMTg0IDM2LjgxMDVDMTAyLjk1NCAzNi41ODIgMTAzLjcyOCAzNi4zMDcgMTA0LjUwNyAzNS45ODU0VjQwLjIyNTZDMTAzLjY4NiA0MC41ODk1IDEwMi44NDQgNDAuODUxOSAxMDEuOTgxIDQxLjAxMjdDMTAxLjEyNiA0MS4xNzM1IDEwMC4yMTYgNDEuMjUzOSA5OS4yNTEzIDQxLjI1MzlDOTcuMjM2OSA0MS4yNTM5IDk1LjU4NjUgNDAuODU2MSA5NC4zMDAxIDQwLjA2MDVDOTMuMDIyMSAzOS4yNTY1IDkyLjA3ODQgMzguMTQzNiA5MS40NjkgMzYuNzIxN0M5MC44NjgxIDM1LjI5OTggOTAuNTY3NyAzMy42NDk0IDkwLjU2NzcgMzEuNzcwNUM5MC41Njc3IDMwLjM2NTYgOTAuNzYyMyAyOS4wNzkxIDkxLjE1MTYgMjcuOTExMUM5MS41NDk0IDI2Ljc0MzIgOTIuMTI5MiAyNS43MzE4IDkyLjg5MDkgMjQuODc3QzkzLjY1MjYgMjQuMDEzNyA5NC41OTIxIDIzLjM0OTMgOTUuNzA5MyAyMi44ODM4Qzk2LjgzNDkgMjIuNDA5OCA5OC4xMjE0IDIyLjE3MjkgOTkuNTY4NiAyMi4xNzI5QzEwMC40NjYgMjIuMTcyOSAxMDEuNDA5IDIyLjI3ODYgMTAyLjQgMjIuNDkwMkMxMDMuMzk4IDIyLjY5MzQgMTA0LjM3MiAyMy4wMjM0IDEwNS4zMiAyMy40ODA1TDEwMy43ODMgMjcuNDI4N0MxMDMuMTA2IDI3LjEwNzEgMTAyLjQyMSAyNi44MzYzIDEwMS43MjcgMjYuNjE2MkMxMDEuMDMzIDI2LjM5NjIgMTAwLjI5NiAyNi4yODYxIDk5LjUxNzkgMjYuMjg2MVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAxSDQwVjQxSDBWMVpNNC4wMDAxOSAzN1Y1SDM2LjAwMDJWMjlIMTIuMDAwMlYzN0g0LjAwMDE5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=="
        alt="OneMAC Logo"
      />
    </Link>
  </header>
));

const EmailNav: React.FC<{ appEndpointUrl: string }> = ({ appEndpointUrl }) => (
  <Section>
    <LogoContainer ref={createRef()} url={appEndpointUrl} />
  </Section>
);

const LoginInstructions: React.FC<{ appEndpointURL: string }> = ({ appEndpointURL }) => (
  <ul style={{ marginLeft: "-20px" }}>
    <li>
      <Text style={styles.text.description}>
        The submission can be accessed in the OneMAC application at{" "}
        <Link href={appEndpointURL}>{appEndpointURL}</Link>
      </Text>
    </li>
    <li>
      <Text style={styles.text.description}>
        If not logged in, click "Login" at the top and use your Enterprise User Administration (EUA)
        credentials.
      </Text>
    </li>
    <li>
      <Text style={styles.text.description}>
        After logging in, you'll see the submission listed on the dashboard. Click its ID number to
        view details.
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
            <Textarea>{value ?? "No additional information submitted"}</Textarea>
          </Row>
        );
      }

      return (
        <Row key={label}>
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

const MailboxNotice: React.FC<{ type: "SPA" | "Waiver" }> = ({ type }) => (
  <Text style={{ ...styles.text.description, marginTop: "16px", marginBottom: "16px" }}>
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

export const EmailFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Section style={styles.section.footer}>{children}</Section>
);

const BasicFooter: React.FC = () => (
  <EmailFooter>
    <Text
      style={{ ...styles.text.footer, margin: "8px" }}
    >{`U.S. Centers for Medicare & Medicaid Services`}</Text>
    <Text style={{ ...styles.text.footer, margin: "8px" }}>
      © {new Date().getFullYear()} | 7500 Security Boulevard, Baltimore, MD 21244
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
      The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are
      receiving this email notification as the Formal RAI for {id} was withdrawn by {submitterName}{" "}
      {submitterEmail}.
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

  return reviewTeam.map((reviewer: any) => `${reviewer.name} <${reviewer.email}>`);
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
