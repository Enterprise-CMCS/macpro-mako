export const styles = {
  reset: {
    margin: "0",
    padding: "0",
    lineHeight: 1.4,
  },
  main: {
    backgroundColor: "#fff",
    color: "#212121",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    margin: "0 auto",
    padding: "20px 0 48px",
  },
  wrapper: {
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "20px 0 48px",
  },
  container: {
    backgroundColor: "#F5F5F5",
  },
  text: {
    title: {
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "16px",
      letterSpacing: "-0.5px",
      marginBottom: "2px",
      marginTop: "2px",
    },
    description: {
      fontSize: "14px",
      lineHeight: "16px",
      color: "#333",
      marginBottom: "2px",
      marginTop: "2px",
    },
    base: {
      color: "#333",
      fontSize: "14px",
      margin: "12px 0",
    },
    list: {
      marginLeft: "-20px",
      fontSize: "14px",
      lineHeight: "16px",
    },
  },
  heading: {
    h1: {
      color: "#333",
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "15px",
    },
    h2: {
      fontSize: "16px",
    },
  },
  section: {
    primary: {
      margin: "8px",
      padding: "8px",
    },
    footer: {
      fontSize: "14px",
      padding: "0 24px",
      fontWeight: "300",
      backgroundColor: "#0071BD",
      color: "#fff",
      textAlign: "center" as const,
    },
  },
  divider: {
    margin: "16px 0",
    borderTop: "2px solid #0071BD",
  },
  logo: {
    container: {
      backgroundColor: "#0071BD",
      padding: "16px",
    },
    link: {
      display: "block",
      maxWidth: "112px",
    },
  },
} as const;
