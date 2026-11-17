import { SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL, SeatoolMissingRecordRow } from "../types";

export const SEA_TOOL_URL = "https://sea.cms.gov/";

const FONT = "Arial, Helvetica, sans-serif";
const TEXT_COLOR = "#212121";
const BANNER_COLOR = "#165296";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatAuthorityLabel(authority: string): string {
  switch (authority.trim().toLowerCase()) {
    case "medicaid spa":
      return "Medicaid SPA";
    case "chip spa":
      return "CHIP SPA";
    case "1915(b)":
    case "1915b":
      return "1915(b)";
    case "1915(c)":
    case "1915c":
      return "1915(c)";
    default:
      return authority;
  }
}

function daysSinceSubmissionText(daysSinceSubmit: number): string {
  if (daysSinceSubmit === 1) {
    return "1 day has passed since submission.";
  }

  return `${daysSinceSubmit} days have passed since submission.`;
}

function linkedName(label: string, href: string): string {
  const safeHref = escapeHtml(href);
  return `<a href="${safeHref}" target="_blank" style="color:${BANNER_COLOR};text-decoration:underline;">${escapeHtml(label)}</a>`;
}

function reminderParagraph(applicationEndpointUrl: string): string {
  return `Either a record was not created in SEA Tool or the SPA/Waiver ID in ${linkedName("OneMAC", applicationEndpointUrl)} and ${linkedName("SEA Tool", SEA_TOOL_URL)} do not match.`;
}

function packageDetails(row: SeatoolMissingRecordRow): string {
  const authority = escapeHtml(formatAuthorityLabel(row.authority));
  const submitted = escapeHtml(row.submissionDate);
  return [
    `<p style="margin:0 0 8px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${TEXT_COLOR};">Authority: ${authority}</p>`,
    `<p style="margin:0 0 8px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${TEXT_COLOR};">Submitted: ${submitted}</p>`,
    `<p style="margin:0;font-family:${FONT};font-size:16px;line-height:24px;color:${TEXT_COLOR};">${escapeHtml(daysSinceSubmissionText(row.daysSinceSubmit))}</p>`,
  ].join("");
}

function packageTable(packages: SeatoolMissingRecordRow[]): string {
  const headerCell = `style="padding:8px;border:1px solid #dddddd;font-family:${FONT};font-size:14px;line-height:20px;font-weight:bold;color:${TEXT_COLOR};text-align:left;"`;
  const cell = `style="padding:8px;border:1px solid #dddddd;font-family:${FONT};font-size:14px;line-height:20px;color:${TEXT_COLOR};text-align:left;"`;
  const rows = packages
    .map((row) => {
      return `<tr>
        <td ${cell}>${escapeHtml(row.id)}</td>
        <td ${cell}>${escapeHtml(row.submissionDate)}</td>
        <td ${cell}>${escapeHtml(formatAuthorityLabel(row.authority))}</td>
        <td ${cell}>${escapeHtml(String(row.daysSinceSubmit))}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
    <tr>
      <th ${headerCell}>Package ID</th>
      <th ${headerCell}>Submitted</th>
      <th ${headerCell}>Authority</th>
      <th ${headerCell}>Days since submission</th>
    </tr>
    ${rows}
  </table>`;
}

function messageBody(packages: SeatoolMissingRecordRow[], applicationEndpointUrl: string): string {
  const reminder = reminderParagraph(applicationEndpointUrl);
  const [onlyPackage] = packages;
  if (packages.length === 1 && onlyPackage) {
    const heading = `This is a reminder that there is no matching record in ${linkedName("SEA Tool", SEA_TOOL_URL)} for ${escapeHtml(onlyPackage.id)}.`;
    return `<h2 style="margin:0 0 16px 0;font-family:${FONT};font-size:20px;line-height:28px;font-weight:bold;color:${TEXT_COLOR};">${heading}</h2>
      <p style="margin:0 0 16px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${TEXT_COLOR};">${reminder}</p>
      ${packageDetails(onlyPackage)}`;
  }

  return `<h2 style="margin:0 0 16px 0;font-family:${FONT};font-size:20px;line-height:28px;font-weight:bold;color:${TEXT_COLOR};">This is a reminder that there is no matching record in ${linkedName("SEA Tool", SEA_TOOL_URL)} for the following packages.</h2>
    <p style="margin:0 0 16px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${TEXT_COLOR};">${reminder}</p>
    ${packageTable(packages)}`;
}

export function buildSeatoolMissingRecordEmailHtml({
  packages,
  applicationEndpointUrl,
}: {
  packages: SeatoolMissingRecordRow[];
  applicationEndpointUrl: string;
}): string {
  const banner = `Please respond to this email address, <a href="mailto:${SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL}" style="color:#ffffff;text-decoration:underline;">${SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL}</a>, if you have any further questions.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>No matching record in SEA Tool</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 16px;font-family:${FONT};color:${TEXT_COLOR};">
        ${messageBody(packages, applicationEndpointUrl)}
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="${BANNER_COLOR}" style="background-color:${BANNER_COLOR};padding:20px;font-family:${FONT};font-size:14px;line-height:22px;color:#ffffff;">
        ${banner}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildSeatoolMissingRecordEmailText(packages: SeatoolMissingRecordRow[]): string {
  const closing = `Please respond to this email address, ${SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL}, if you have any further questions.`;
  const [onlyPackage] = packages;
  if (packages.length === 1 && onlyPackage) {
    return [
      `This is a reminder that there is no matching record in SEA Tool for ${onlyPackage.id}. Either a record was not created in SEA Tool or the SPA/Waiver ID in OneMAC and SEA Tool do not match.`,
      `Authority: ${formatAuthorityLabel(onlyPackage.authority)}`,
      `Submitted: ${onlyPackage.submissionDate}`,
      daysSinceSubmissionText(onlyPackage.daysSinceSubmit),
      closing,
    ].join("\n\n");
  }

  const lines = packages.map((row) => {
    return `${row.id} | Submitted ${row.submissionDate} | ${formatAuthorityLabel(row.authority)} | ${daysSinceSubmissionText(row.daysSinceSubmit)}`;
  });

  return [
    "This is a reminder that there is no matching record in SEA Tool for the following packages. Either a record was not created in SEA Tool or the SPA/Waiver ID in OneMAC and SEA Tool do not match.",
    ...lines,
    closing,
  ].join("\n\n");
}
