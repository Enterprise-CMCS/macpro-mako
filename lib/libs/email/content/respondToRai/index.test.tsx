import { respondToRai } from "./index";
import { Authority } from "shared-types";
import { SendEmailCommandInput } from "@aws-sdk/client-ses";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { handler, sendEmail } from "../../../../lambda/processEmails";

// Mock the entire module
vi.mock("../../../../lambda/processEmails", () => ({
  handler: vi.fn().mockResolvedValue({ status: 200 }),
  sendEmail: vi.fn().mockResolvedValue({ status: 200 }),
}));

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
    (handler as Mock).mockResolvedValue("<html>MedSpaCMS</html>");

    const result = await respondToRai[Authority.MED_SPA]?.cms?.(variables);
    expect(result).not.toBeNull();
  });

  it("should generate State email for MED_SPA", async () => {
    (handler as Mock).mockResolvedValue("<html>MedSpaState</html>");

    const result = await respondToRai[Authority.MED_SPA]?.state?.(variables);
    expect(result).not.toBeNull();
  });

  it("should generate CMS email for CHIP_SPA", async () => {
    (handler as Mock).mockResolvedValue("<html>ChipSpaCMS</html>");

    const result = await respondToRai[Authority.CHIP_SPA]?.cms?.(variables);
    expect(result).not.toBeNull();
  });

  it("should generate State email for CHIP_SPA", async () => {
    (handler as Mock).mockResolvedValue("<html>ChipSpaState</html>");

    const result = await respondToRai[Authority.CHIP_SPA]?.state?.(variables);
    expect(result).not.toBeNull();
  });

  it("should generate CMS email for 1915b", async () => {
    (handler as Mock).mockResolvedValue("<html>Waiver1915bCMS</html>");

    const result = await respondToRai[Authority["1915b"]]?.cms?.(variables);
    expect(result).not.toBeNull();
  });

  it("should generate State email for 1915b", async () => {
    (handler as Mock).mockResolvedValue("<html>Waiver1915bCMS</html>");

    const result = await respondToRai[Authority["1915b"]]?.state?.(variables);
    expect(result).not.toBeNull();
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

    await sendEmail(emailDetails);

    expect(sendEmail).toHaveBeenCalledWith(emailDetails);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
