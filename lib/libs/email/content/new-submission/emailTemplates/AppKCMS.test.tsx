import { describe, it, expect } from "vitest";
import { AppKCMSEmail, AppKEmailProps } from "./AppKCMS";
import { render } from "@testing-library/react";

describe("AppKCMSEmail Snapshot Test", () => {
  it("renders the AppKCMSEmail component correctly", () => {
    const variables: AppKEmailProps = {
      id: "test",
      authority: "1915(c)",
      territory: "MD",
      applicationEndpointUrl: "http://localhost:5000",
      actionType: "New",
      allStateUsersEmails: [],
      responseDate: Date.now(),
      title: "Hello Test",
      event: "app-k",
      proposedEffectiveDate: Date.now(),
      submitterName: "Tester McTester",
      submitterEmail: "test@email.com",
      additionalInformation: "",
      attachments: {
        appk: {
          label: "test",
          files: [{
            title: "test",
            filename: "test",
            bucket: "test",
            key: "test",
            uploadDate: Date.now()
          }]
        },
        other: {
          label: "other",
        }
      }
    }
    const { container } = render(<AppKCMSEmail variables={variables} />);
    console.log(container);
    expect(container).toMatchSnapshot();
  });
});
