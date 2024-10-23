import {
  Text,
  Link,
  Section,
  Row,
  Column,
  Hr,
  Heading,
  Img,
} from "@react-email/components";
import { Attachment, TextareaProps } from "shared-types";

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
        padding: "8px 12px",
        fontSize: "16px",
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

export const EmailNav = (props: { appEndpointUrl: string }) => {
  return (
    <Section>
      <Row style={{ backgroundColor: "#0071BD", padding: "16px" }}>
        <Column style={{ maxWidth: "112px" }}>
          <Link href={props.appEndpointUrl}>
            <Img
              height={40}
              width={112}
              src={"https://mako-dev.cms.gov/assets/onemac_logo-BFuMCpJm.svg"}
              alt="OneMAC Logo"
            />
          </Link>
        </Column>
        <Column style={{ flex: 1 }}></Column>
      </Row>
    </Section>
  );
};

export const LoginInstructions = (props: { appEndpointURL: string }) => {
  return (
    <Section>
      <ul style={{ maxWidth: "760px" }}>
        <li>
          <Text>
            The submission can be accessed in the OneMAC application, which you
            can find at{" "}
            <Link href={props.appEndpointURL}>{props.appEndpointURL}</Link>.
          </Text>
        </li>
        <li>
          <Text>
            If you are not already logged in, please click the "Login" link at
            the top of the page and log in using your Enterprise User
            Administration (EUA) credentials.
          </Text>
        </li>
        <li>
          <Text>
            After you have logged in, you will be taken to the OneMAC
            application. The submission will be listed on the dashboard page,
            and you can view its details by clicking on its ID number.
          </Text>
        </li>
      </ul>
    </Section>
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
      <Hr style={{ margin: "16px 0", borderTop: "2px solid #0071BD" }} />
      <Heading as="h3">Files:</Heading>
      <Section>
        {attachmentKeys?.map(
          (key: keyof typeof props.attachments, idx: number) => {
            if (!props.attachments[key].files) return;
            const title = props.attachments[key].label;
            const filenames = createAttachementList(
              props.attachments[key].files,
            );
            return (
              <Row key={key + String(idx)}>
                <Column style={{ width: "200px", paddingTop: "8px" }}>
                  <Text style={styles.textTitle}>{title}</Text>
                </Column>
                <Column>
                  <Text style={styles.textDescription}>{filenames}</Text>
                </Column>
              </Row>
            );
          },
        )}
      </Section>
    </>
  );
};

export const PackageDetails = (props: {
  details: { [key: string]: string | null | undefined };
  attachments: AttachmentsType | null;
}) => {
  return (
    <Section>
      {Object.keys(props.details).map((label: string, idx: number) => {
        if (label === "Summary") {
          const summary =
            props.details[label] ?? "No additional information submitted";
          return (
            <Row>
              <Hr
                style={{ margin: "16px 0", borderTop: "2px solid #0071BD" }}
              />
              <Text style={{ margin: ".5em" }}>
                <Heading as="h3">Summary:</Heading>
              </Text>
              <Textarea>{summary}</Textarea>
            </Row>
          );
        }
        return (
          <Row key={label + idx}>
            <Column align="left" style={{ width: "200px", paddingTop: "8px" }}>
              <Text style={styles.textTitle}>{label}</Text>
            </Column>
            <Column>
              <Text style={styles.textDescription}>
                {props.details[label] ?? "Unknown"}
              </Text>
            </Column>
          </Row>
        );
      })}
      {props.attachments && <Attachments attachments={props.attachments} />}
      <Hr style={{ margin: "16px 0", borderTop: "2px solid #0071BD" }} />
    </Section>
  );
};

export const MailboxSPA = () => {
  return (
    <Text>
      This mailbox is for the submittal of State Plan Amendments and non-web
      based responses to Requests for Additional Information (RAI) on submitted
      SPAs only. Any other correspondence will be disregarded.
    </Text>
  );
};

export const MailboxWaiver = () => {
  return (
    <Text>
      This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
      responses to Requests for Additional Information (RAI) on Waivers, and
      extension requests on Waivers only. Any other correspondence will be
      disregarded.
    </Text>
  );
};

export const ContactStateLead = (props: { isChip?: boolean }) => {
  return (
    <Section>
      <Hr style={{ margin: "16px 0", borderTop: "2px solid #0071BD" }} />
      <Text>
        If you have questions or did not expect this email, please contact{" "}
        {props.isChip ? (
          <Link href="mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov">
            CHIPSPASubmissionMailBox@CMS.HHS.gov
          </Link>
        ) : (
          <Link href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</Link>
        )}{" "}
        or your state lead.
      </Text>
      <Text>Thank you!</Text>
    </Section>
  );
};

export const SpamWarning = () => {
  return (
    <Section>
      <Text>
        If the contents of this email seem suspicious, do not open them, and
        instead forward this email to{" "}
        <Link href="mailto:SPAM@cms.hhs.gov">SPAM@cms.hhs.gov</Link>.
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
      <Heading as="h3">
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
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: "#ffffff",
  ...resetText,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "660px",
  maxWidth: "100%",
};

const tableCell = { display: "table-cell" };

const heading = {
  fontSize: "24px",
  fontWeight: "300",
  color: "#888888",
};

const informationTable = {
  borderCollapse: "collapse" as const,
  borderSpacing: "0px",
  color: "rgb(51,51,51)",
  backgroundColor: "rgb(250,250,250)",
  borderRadius: "3px",
  fontSize: "12px",
};

const informationTableRow = {
  height: "46px",
};

const informationTableColumn = {
  paddingLeft: "20px",
  borderStyle: "solid",
  borderColor: "white",
  borderWidth: "0px 1px 1px 0px",
  height: "44px",
};

const informationTableLabel = {
  ...resetText,
  color: "rgb(102,102,102)",
  fontSize: "10px",
};

const informationTableValue = {
  fontSize: "12px",
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: "30px 0 15px 0",
  height: "24px",
};

const productsTitle = {
  background: "#fafafa",
  paddingLeft: "10px",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const productIcon = {
  margin: "0 0 0 20px",
  borderRadius: "14px",
  border: "1px solid rgba(128,128,128,0.2)",
};

const textTitle = { fontSize: "14px", fontWeight: "600", ...resetText };

const textDescription = {
  fontSize: "14px",
  color: "rgb(102,102,102)",
  ...resetText,
};

const productLink = {
  fontSize: "12px",
  color: "rgb(0,112,201)",
  textDecoration: "none",
};

const divisor = {
  marginLeft: "4px",
  marginRight: "4px",
  color: "rgb(51,51,51)",
  fontWeight: 200,
};

export const styles = {
  main,
  resetText,
  container,
  tableCell,
  heading,
  informationTable,
  informationTableRow,
  informationTableColumn,
  informationTableLabel,
  informationTableValue,
  productTitleTable,
  productsTitle,
  productIcon,
  textTitle,
  textDescription,
  productLink,
  divisor,
  Textarea,
};
