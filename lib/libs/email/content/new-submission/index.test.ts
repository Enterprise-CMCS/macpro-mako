import { newSubmission } from "./index";
import { render } from "@react-email/render";
import { Authority, EmailAddresses, OneMac } from "shared-types";
import { CommonVariables } from "../..";
import { Mock, vi } from "vitest";

vi.mock("@react-email/render", () => ({
  render: vi.fn(),
}));

const mockRender = render as Mock;

describe("newSubmission", () => {
  const commonVariables: CommonVariables = {
    id: "123",
    actionType: "submission",
    to: "example@example.com", // Add the missing properties
    territory: "someTerritory",
    applicationEndpointUrl: "http://example.com",
    allStateUsersEmails: ["user1@example.com", "user2@example.com"],
  };

  const emailAddresses: EmailAddresses = {
    osgEmail: ["osg@example.com"],
    chipInbox: ["chip@example.com"],
    chipCcList: [], // Add this line to fix the error
    srtEmails: ["srt@example.com"],
    cpocEmail: ["cpoc@example.com"],
    dpoEmail: ["dpo@example.com"],
    dmcoEmail: ["dmco@example.com"],
    dhcbsooEmail: ["dhcbsoo@example.com"],
    sourceEmail: "source@example.com",
  };

  const variables: OneMac & CommonVariables & { emails: EmailAddresses } = {
    ...commonVariables,
    emails: {
      ...emailAddresses,
    },
    authority: "1915b",
    origin: "CMS",
    appkParentId: "123",
    originalWaiverNumber: "123",
    additionalInformation: "123",
    submitterName: "123",
    submitterEmail: "123",
    changedDate: 123,
    raiWithdrawEnabled: true,
    allStateUsersEmails: ["state1@example.com", "state2@example.com"],
  };

  beforeEach(() => {
    mockRender.mockClear();
  });

  it("should generate MedSpa CMS email", async () => {
    mockRender.mockResolvedValueOnce("<html>MedSpa CMS Email</html>");
    const result = await newSubmission[Authority.MED_SPA]?.cms?.(variables);
    expect(result).toEqual({
      to: emailAddresses.osgEmail,
      subject: `Medicaid SPA ${variables.id} Submitted`,
      html: "<html>MedSpa CMS Email</html>",
      text: "<html>MedSpa CMS Email</html>",
    });
  });

  it("should generate MedSpa State email", async () => {
    mockRender.mockResolvedValueOnce("<html>MedSpa State Email</html>");
    const result = await newSubmission[Authority.MED_SPA]?.state?.(variables);
    expect(result).toEqual({
      to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
      subject: `Your SPA ${variables.id} has been submitted to CMS`,
      html: "<html>MedSpa State Email</html>",
      text: "<html>MedSpa State Email</html>",
    });
  });

  it("should generate CHIP SPA CMS email", async () => {
    mockRender.mockResolvedValueOnce("<html>CHIP SPA CMS Email</html>");
    const result = await newSubmission[Authority.CHIP_SPA]?.cms?.(variables);
    expect(result).toEqual({
      to: emailAddresses.chipInbox,
      cc: emailAddresses.chipCcList,
      subject: `New CHIP SPA ${variables.id} Submitted`,
      html: "<html>CHIP SPA CMS Email</html>",
      text: "<html>CHIP SPA CMS Email</html>",
    });
  });

  it("should generate CHIP SPA State email", async () => {
    mockRender.mockResolvedValueOnce("<html>CHIP SPA State Email</html>");
    const result = await newSubmission[Authority.CHIP_SPA]?.state?.(variables);
    expect(result).toEqual({
      to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
      subject: `Your CHIP SPA ${variables.id} has been submitted to CMS`,
      html: "<html>CHIP SPA State Email</html>",
      text: "<html>CHIP SPA State Email</html>",
    });
  });

  it("should generate 1915b CMS email", async () => {
    mockRender.mockResolvedValueOnce("<html>1915b CMS Email</html>");
    const result = await newSubmission[Authority["1915b"]]?.cms?.(variables);
    expect(result).toEqual({
      to: emailAddresses.osgEmail,
      subject: `${variables.authority} ${variables.id} Submitted`,
      html: "<html>1915b CMS Email</html>",
      text: "<html>1915b CMS Email</html>",
    });
  });

  it("should generate 1915b State email", async () => {
    mockRender.mockResolvedValueOnce("<html>1915b State Email</html>");
    const result = await newSubmission[Authority["1915b"]]?.state?.(variables);
    expect(result).toEqual({
      to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
      subject: `Your ${variables.actionType} ${variables.id} has been submitted to CMS`,
      html: "<html>1915b State Email</html>",
      text: "<html>1915b State Email</html>",
    });
  });

  it("should generate 1915c CMS email", async () => {
    mockRender.mockResolvedValueOnce("<html>1915c CMS Email</html>");
    const result = await newSubmission[Authority["1915c"]]?.cms?.(variables);
    expect(result).toEqual({
      to: emailAddresses.osgEmail,
      subject: `1915(c) ${variables.id} Submitted`,
      html: "<html>1915c CMS Email</html>",
      text: "<html>1915c CMS Email</html>",
    });
  });

  it("should generate 1915c State email", async () => {
    mockRender.mockResolvedValueOnce("<html>1915c State Email</html>");
    const result = await newSubmission[Authority["1915c"]]?.state?.(variables);
    expect(result).toEqual({
      to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
      subject: `Your 1915(c) ${variables.id} has been submitted to CMS`,
      html: "<html>1915c State Email</html>",
      text: "<html>1915c State Email</html>",
    });
  });
});
