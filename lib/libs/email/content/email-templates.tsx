import { Heading, Section, Text } from "@react-email/components";
import { EmailNav, EmailFooter } from "./email-components";
import { styles } from "./email-styles";
import { ReactNode } from "react";
import { EmailWrapper } from "./email-wrapper";

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
  <EmailWrapper previewText={previewText}>
    <EmailNav appEndpointUrl={applicationEndpointUrl} />
    <Section style={styles.section.primary}>
      <Heading style={styles.heading.h1}>{heading}</Heading>
      {children}
      <Text style={{ ...styles.text.base }}>Thank you.</Text>
    </Section>
    <EmailFooter>{footerContent}</EmailFooter>
  </EmailWrapper>
);
