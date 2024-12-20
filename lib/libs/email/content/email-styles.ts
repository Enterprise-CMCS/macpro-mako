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
      lineHeight: "1.4",
      letterSpacing: "-0.5px",
      marginBottom: "4px",
      marginTop: "4px",
    },
    description: {
      fontSize: "14px",
      lineHeight: "1.4",
      color: "#333",
      marginBottom: "4px",
      marginTop: "4px",
    },
    base: {
      color: "#333",
      lineHeight: "1.4",
      fontSize: "14px",
      margin: "12px 0",
    },
    footer: {
      color: "#fff",
      fontSize: "14px",
    },
    list: {
      marginLeft: "-20px",
      fontSize: "14px",
      lineHeight: "1.4",
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
      marginTop: "0",
      padding: "8px",
    },
    footer: {
      fontSize: "14px",
      padding: "0 0px",
      fontWeight: "300",
      backgroundColor: "#0071BD",
      color: "#fff",
      textAlign: "center" as const,
    },
  },
  divider: {
    width: "100%",
    borderTop: "1px solid #0071BD",
    margin: "16px 0px",
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
  } as const,
};
