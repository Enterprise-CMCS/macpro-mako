import { Column, Heading, Link, Row, Section, Text } from "@react-email/components";

import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";
import { SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL, SeatoolMissingRecordRow } from "../types";

export const SeatoolMissingRecordEmail = ({
  applicationEndpointUrl,
  packages,
}: {
  applicationEndpointUrl: string;
  packages: SeatoolMissingRecordRow[];
}) => (
  <BaseEmailTemplate
    previewText="No matching record in SEA Tool"
    heading="No matching record in SEA Tool"
    applicationEndpointUrl={applicationEndpointUrl}
    footerContent={
      <>
        <Text style={{ ...styles.text.footer, margin: "8px" }}>
          If you have questions, please contact{" "}
          <Link
            href={`mailto:${SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL}`}
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            {SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL}
          </Link>
          .
        </Text>
        <Text style={{ ...styles.text.footer, margin: "8px" }}>
          U.S. Centers for Medicare & Medicaid Services
        </Text>
      </>
    }
  >
    <Text style={styles.text.base}>
      The listed packages have no matching SEA Tool record. The record was not created, or the IDs
      do not match.
    </Text>
    <Section>
      <Row>
        <Column>
          <Heading as="h2" style={styles.heading.h2}>
            Package ID
          </Heading>
        </Column>
        <Column>
          <Heading as="h2" style={styles.heading.h2}>
            Submission date
          </Heading>
        </Column>
        <Column>
          <Heading as="h2" style={styles.heading.h2}>
            Authority
          </Heading>
        </Column>
        <Column>
          <Heading as="h2" style={styles.heading.h2}>
            Days since submit
          </Heading>
        </Column>
      </Row>
      {packages.map((row) => (
        <Row key={row.id}>
          <Column>
            <Text style={styles.text.description}>{row.id}</Text>
          </Column>
          <Column>
            <Text style={styles.text.description}>{row.submissionDate}</Text>
          </Column>
          <Column>
            <Text style={styles.text.description}>{row.authority}</Text>
          </Column>
          <Column>
            <Text style={styles.text.description}>{row.daysSinceSubmit}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  </BaseEmailTemplate>
);
