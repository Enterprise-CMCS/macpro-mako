import { respondToRai } from "./index";
import { Authority } from "shared-types";
import { render } from "@react-email/render";
import { SendEmailCommandInput } from "@aws-sdk/client-ses";
import { processEmails } from "../../../../lambda";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
vi.mock("../../../lambda/processEmails");

describe("respondToRai", () => {
  const variables = {
    id: "12345",
    submitterName: "John Doe",
    submitterEmail: "john.doe@example.com",
    emails: {
      osgEmail: ["osg@example.com"],
      cpocEmail: ["cpoc@example.com"],
      srtEmails: ["srt@example.com"],
      chipInbox: ["chip@example.com"],
      chipCcList: ["chipcc@example.com"],
      dmcoEmail: ["dmco@example.com"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate CMS email for MED_SPA", async () => {
    (render as Mock).mockResolvedValue("<html>MedSpaCMS</html>");

    const result = await respondToRai[Authority.MED_SPA]?.cms?.(variables);
    expect(result).toEqual({
      to: ["osg@example.com", "cpoc@example.com", "srt@example.com"],
      subject: "Medicaid SPA RAI Response for 12345 Submitted",
      html: "<html>MedSpaCMS</html>",
      text: "<html>MedSpaCMS</html>",
    });
  });

  it("should generate State email for MED_SPA", async () => {
    (render as Mock).mockResolvedValue("<html>MedSpaState</html>");

    const result = await respondToRai[Authority.MED_SPA]?.state?.(variables);
    expect(result).toEqual({
      to: ['"John Doe" <john.doe@example.com>'],
      subject:
        "Your Medicaid SPA RAI Response for 12345 has been submitted to CMS",
      html: "<html>MedSpaState</html>",
      text: "<html>MedSpaState</html>",
    });
  });

  it("should generate CMS email for CHIP_SPA", async () => {
    (render as Mock).mockResolvedValue("<html>ChipSpaCMS</html>");

    const result = await respondToRai[Authority.CHIP_SPA]?.cms?.(variables);
    expect(result).toEqual({
      to: ["chip@example.com", "srt@example.com", "cpoc@example.com"],
      cc: ["chipcc@example.com"],
      subject: "CHIP SPA RAI Response for 12345 Submitted",
      html: "<html>ChipSpaCMS</html>",
      text: "<html>ChipSpaCMS</html>",
    });
  });

  it("should generate State email for CHIP_SPA", async () => {
    (render as Mock).mockResolvedValue("<html>ChipSpaState</html>");

    const result = await respondToRai[Authority.CHIP_SPA]?.state?.(variables);
    expect(result).toEqual({
      to: ['"John Doe" <john.doe@example.com>'],
      subject: "Your CHIP SPA RAI Response for 12345 has been submitted to CMS",
      html: "<html>ChipSpaState</html>",
      text: "<html>ChipSpaState</html>",
    });
  });

  it("should generate CMS email for 1915b", async () => {
    (render as Mock).mockResolvedValue("<html>Waiver1915bCMS</html>");

    const result = await respondToRai[Authority["1915b"]]?.cms?.(variables);
    expect(result).toEqual({
      to: [
        "osg@example.com",
        "dmco@example.com",
        "cpoc@example.com",
        "srt@example.com",
      ],
      subject: "Waiver RAI Response for 12345 Submitted",
      html: "<html>Waiver1915bCMS</html>",
      text: "<html>Waiver1915bCMS</html>",
    });
  });

  it("should generate State email for 1915b", async () => {
    (render as Mock).mockResolvedValue("<html>Waiver1915bState</html>");

    const result = await respondToRai[Authority["1915b"]]?.cms?.({
      ...variables,
      allStateUsersEmails: ["stateuser1@example.com", "stateuser2@example.com"],
    });
    expect(result).toEqual({
      to: ['"John Doe" <john.doe@example.com>'],
      cc: ["stateuser1@example.com", "stateuser2@example.com"],
      subject: "Your 1915b 1915b Response for 12345 has been submitted to CMS",
      html: "<html>Waiver1915bState</html>",
      text: "<html>Waiver1915bState</html>",
    });
  });

  it("should call sendEmail with correct parameters", async () => {
    const emailDetails: SendEmailCommandInput = {
      Destination: {
        ToAddresses: ["recipient@example.com"],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "<html>Test</html>",
          },
          Text: {
            Charset: "UTF-8",
            Data: "Test",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Test Email",
        },
      },
      Source: "sender@example.com",
    };

    (processEmails.createEmailParams as Mock).mockReturnValue(emailDetails);
    (processEmails.sendEmail as Mock).mockResolvedValue(undefined);

    await processEmails.sendEmail(emailDetails);
    expect(processEmails.sendEmail).toHaveBeenCalledWith(emailDetails);
  });
});
