import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import { EmailNav, EmailFooter } from "./email-components";
import { styles } from "./email-styles";
import { ReactNode } from "react";

interface BaseEmailTemplateProps {
  previewText: string;
  heading: string;
  children?: ReactNode;
  footerContent?: ReactNode;
  applicationEndpointUrl: string;
}

export const BaseEmailTemplate = ({
  previewText,
  heading,
  children,
  footerContent,
  applicationEndpointUrl,
}: BaseEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <EmailNav appEndpointUrl={applicationEndpointUrl} />
        <div style={styles.section.primary}>
          <Heading style={styles.heading.h1}>{heading}</Heading>
          {children}
          <Text style={{ ...styles.text.base }}>Thank you.</Text>
        </div>
        <EmailFooter>{footerContent}</EmailFooter>
      </Container>
    </Body>
  </Html>
);
