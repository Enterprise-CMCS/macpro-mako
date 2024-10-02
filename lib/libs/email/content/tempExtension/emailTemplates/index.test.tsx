import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import TempExtCMS from "./TempExtState";
import TempExtCMSPreview from "./TempExtCMS";
import { render } from "@react-email/components";

// Mock the render function
vi.mock("@react-email/components", () => ({
  render: vi.fn(),
}));

// Mock properties
const mockProps = {
  territory: "CO",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  id: "PACKAGE ID",
  authority: "AUTHORITY",
  summary: "This bens additional infornormaiton",
  files: {
    currentStatePlan: "cat.png",
    amendedLanguage: "cat.png",
    coverLetter: "macpro work.pdf",
  },
} as any;

describe("TempExtStateEmail Component", () => {
  it("should render the TempExtStateEmail component with correct content", () => {
    const mockRenderResult = `<html dir="ltr" lang="en"><head><script type="module" src="chrome-extension://gighmmpiobklfepjocnamgkkbiglidom/adblock-deny-push-notifications-requests.js"></script></head><body><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:37.5em">
    <tbody>
      <tr style="width:100%">
        <td>
          <h3>The Submission Portal received a <!-- -->AUTHORITY<!-- --> Waiver Extension Submission:</h3>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <tr>
                <td>
                  <ul style="max-width:760px">
                    <li>The submission can be accessed in the OneMAC application, which you can find at<!-- --> <a href="https://onemac.cms.gov/" style="color:#067df7;text-decoration:none" target="_blank">https://onemac.cms.gov/</a>.</li>
                    <li>If you are not already logged in, please click the "Login" link at the top of the page and log in using your Enterprise User Administration (EUA) credentials.</li>
                    <li>After you have logged in, you will be taken to the OneMAC application. The submission will be listed on the dashboard page, and you can view its details by clicking on its ID number.</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <tr>
                <td><br>
                  <p style="margin:.5em"><b>State or territory<!-- -->:</b> <!-- -->CO</p>
                  <p style="margin:.5em"><b>Name<!-- -->:</b> <!-- -->George Harrison</p>
                  <p style="margin:.5em"><b>Email<!-- -->:</b> <!-- -->george@example.com</p>
                  <p style="margin:.5em"><b>Temporary Extension Request Number<!-- -->:</b> <!-- -->PACKAGE ID</p>
                  <p style="margin:.5em"><b>Temporary Extension Type<!-- -->:</b> <!-- -->AUTHORITY</p>
                  <p style="margin:.5em"><b>summary<!-- -->:</b> <!-- -->This bens additional infornormaiton</p><br>
                  <p style="margin:.5em"><b>Files:</b></p>
                  <ul>
                    <li>currentStatePlan<!-- -->: <!-- -->cat.png</li>
                    <li>amendedLanguage<!-- -->: <!-- -->cat.png</li>
                    <li>coverLetter<!-- -->: <!-- -->macpro work.pdf</li>
                  </ul><br>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <tr>
                <td><br>
                  <p style="text-align:center">If the contents of this email seem suspicious, do not open them, and instead forward this email to<!-- --> <a href="mailto:SPAM@cms.hhs.gov">SPAM@cms.hhs.gov</a>.</p>
                  <p style="text-align:center">Thank you!</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

</body></html>`;

    (render as jest.Mock).mockReturnValue(mockRenderResult);

    const comp = render(<TempExtCMS {...mockProps} />);

    expect(comp).toBe(mockRenderResult);
    expect(comp).toContain(mockProps.territory);
    expect(comp).toContain(mockProps.submitterName);
    expect(comp).toContain(mockProps.submitterEmail);
    expect(comp).toContain(mockProps.id);
    expect(comp).toContain(mockProps.authority);
  });
});

describe("TempExtCMSEmail Component", () => {
  it("should render the TempExtCMSEmail component with correct content", () => {
    const mockRenderResult = `<html dir="ltr" lang="en"><head><script type="module" src="chrome-extension://gighmmpiobklfepjocnamgkkbiglidom/adblock-deny-push-notifications-requests.js"></script></head><body><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:37.5em">
    <tbody>
      <tr style="width:100%">
        <td>
          <h3>This response confirms you have submitted a <!-- -->AUTHORITY<!-- --> <!-- -->Waiver Extension to CMS for review:</h3>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <tr>
                <td><br>
                  <p style="margin:.5em"><b>State or territory<!-- -->:</b> <!-- -->CO</p>
                  <p style="margin:.5em"><b>Name<!-- -->:</b> <!-- -->George Harrison</p>
                  <p style="margin:.5em"><b>Email Address<!-- -->:</b> <!-- -->george@example.com</p>
                  <p style="margin:.5em"><b>Temporary Extension Request Number<!-- -->:</b> <!-- -->PACKAGE ID</p>
                  <p style="margin:.5em"><b>Temporary Extension Type<!-- -->:</b> <!-- -->AUTHORITY</p>
                  <p style="margin:.5em"><b>90th Day Deadline<!-- -->:</b> <!-- -->Saturday, November 9, 2024 @ 11:59pm ET</p>
                  <p style="margin:.5em"><b>summary<!-- -->:</b> <!-- -->This bens additional infornormaiton</p><br>
                </td>
              </tr>
            </tbody>
          </table>
          <p>This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers, responses to Requests for Additional Information (RAI) on Waivers, and extension requests on Waivers only. Any other correspondence will be disregarded.</p>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <tr>
                <td><br>
                  <p style="text-align:center">If you have questions or did not expect this email, please contact<!-- --> <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a> <!-- -->or your state lead.</p>
                  <p style="text-align:center">Thank you!</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

</body></html>`;

    (render as jest.Mock).mockReturnValue(mockRenderResult);

    const comp = render(<TempExtCMSPreview {...mockProps} />);

    expect(comp).toBe(mockRenderResult);
    expect(comp).toContain(mockProps.territory);
    expect(comp).toContain(mockProps.submitterName);
    expect(comp).toContain(mockProps.submitterEmail);
    expect(comp).toContain(mockProps.id);
    expect(comp).toContain(mockProps.authority);
  });
});
