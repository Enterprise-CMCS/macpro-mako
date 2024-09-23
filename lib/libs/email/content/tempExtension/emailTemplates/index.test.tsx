import * as React from "react";
import { render } from "@testing-library/react";
import TempExtCMS from "./TempExtState";
import { emailTemplateValue } from "../../new-submission/data";
import TempExtCMSPreview from "./TempExtCMS";

describe("TempExtStateEmail Component", () => {
  it("should render the TempExtStateEmail component with correct content", () => {
    const { getByText } = render(<TempExtCMS />);

    expect(
      getByText(/This response confirms you have submitted a/i),
    ).toBeInTheDocument();
    expect(getByText(emailTemplateValue.territory)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.submitterName)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.submitterEmail)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.id)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.authority)).toBeInTheDocument();
  });
});

describe("TempExtCMSEmail Component", () => {
  it("should render the TempExtCMSEmail component with correct content", () => {
    const { getByText } = render(<TempExtCMSPreview />);

    expect(getByText(/The Submission Portal received a/i)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.territory)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.submitterName)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.submitterEmail)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.id)).toBeInTheDocument();
    expect(getByText(emailTemplateValue.authority)).toBeInTheDocument();
  });
});
