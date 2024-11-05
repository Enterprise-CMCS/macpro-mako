import { Body, Container, Head, Heading, Html, Preview } from "@react-email/components";
import { EmailNav, EmailFooter } from "./email-components";
import { styles } from "./email-styles";
import { ReactNode } from "react";

// Base email template that can be reused for different email types
export const BaseEmailTemplate: React.FC<{
  previewText: string;
  heading: string;
  children?: ReactNode;
  footerContent?: ReactNode;
  applicationEndpointUrl: string;
}> = ({ previewText, heading, children, applicationEndpointUrl, footerContent }) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <EmailNav appEndpointUrl={applicationEndpointUrl} />
        <div style={styles.section.primary}>
          <Heading style={styles.heading.h1}>{heading}</Heading>
          {children}
        </div>
        <EmailFooter>{footerContent}</EmailFooter>
      </Container>
    </Body>
  </Html>
);
