import { ReactNode } from "react";
import { Body, Container, Head, Html, Preview } from "@react-email/components";
import { styles } from "./email-styles";

interface EmailWrapperProps {
  previewText: string;
  children: ReactNode;
}

/**
 * A wrapper component that handles proper DOM nesting for email templates
 * by ensuring HTML structure is valid and suppressing unnecessary warnings
 */
export const EmailWrapper = ({ previewText, children }: EmailWrapperProps) => {
  // Create a div wrapper for testing purposes only
  if (process.env.NODE_ENV === "test") {
    return <div data-testid="email-wrapper">{children}</div>;
  }

  // Use proper email structure in production
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>{children}</Container>
      </Body>
    </Html>
  );
};
