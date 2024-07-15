import { DateTime } from "luxon";

import { getLookupValues, LookupType } from "./lookup-lib";
import { AttachmentKey, attachmentTitleMap } from "shared-types";

interface Attachment {
  title: keyof typeof attachmentTitleMap;
  filename: string;
}

const actionTypeLookup: { [key: string]: string } = {
  New: "Initial Waiver",
  Amend: "Waiver Amendment",
  Renew: "Waiver Renewal",
};

interface Attachment {
  title: AttachmentKey;
  filename: string;
}

interface Data {
  id: string | number;
  notificationMetadata?: {
    submissionDate?: number;
    proposedEffectiveDate?: number;
  };
  submitterEmail?: string;
  submitterName?: string;
  attachments?: Attachment[];
  seaActionType?: string;
  [key: string]: any;
}

interface Bundle {
  lookupList?: string[];
  dataList?: string[];
}

const formatAttachments = (
  formatType: "text" | "html",
  attachmentList?: Attachment[],
): string => {
  const formatChoices = {
    text: {
      begin: "\n\n",
      joiner: "\n",
      end: "\n\n",
    },
    html: {
      begin: "<ul><li>",
      joiner: "</li><li>",
      end: "</li></ul>",
    },
  };
  const format = formatChoices[formatType];
  if (!format) {
    console.log("new format type? ", formatType);
    return "attachment List";
  }
  if (!attachmentList || attachmentList.length === 0) return "no attachments";
  else {
    const attachmentFormat = attachmentList.map((a) => {
      const attachmentTitle = attachmentTitleMap[a.title] ?? a.title;
      return `${attachmentTitle}: ${a.filename}`;
    });
    return `${format.begin}${attachmentFormat.join(format.joiner)}${
      format.end
    }`;
  }
};

const formatDateFromTimestamp = (timestamp?: number): string => {
  if (!timestamp || timestamp <= 0) return "Pending";
  return DateTime.fromMillis(timestamp).toFormat("DDDD");
};

function formatNinetyDaysDate(
  data: Data,
  lookupValues: { [key: string]: any },
): string {
  if (lookupValues?.ninetyDaysDate)
    return formatDateFromTimestamp(lookupValues?.ninetyDaysDate);
  if (!data?.notificationMetadata?.submissionDate) return "Pending";
  return DateTime.fromMillis(data.notificationMetadata.submissionDate)
    .plus({ days: 90 })
    .toFormat("DDDD '@ 11:59pm ET'");
}

export const buildEmailData = async (
  bundle: Bundle,
  data: Data,
): Promise<{ [key: string]: string }> => {
  const returnObject: { [key: string]: string } = {};

  const lookupValues = await getLookupValues(
    bundle.lookupList as LookupType[],
    data.id as string,
  );

  if (
    !bundle.dataList ||
    !Array.isArray(bundle.dataList) ||
    bundle.dataList.length === 0
  )
    return {
      error: "init statement fail",
      bundle: JSON.stringify(bundle),
      data: JSON.stringify(data),
      lookupValues: JSON.stringify(lookupValues),
    };

  bundle.dataList.forEach((dataType) => {
    switch (dataType) {
      case "territory":
        returnObject["territory"] = data.id.toString().substring(0, 2);
        break;
      case "proposedEffectiveDateNice":
        returnObject["proposedEffectiveDateNice"] = formatDateFromTimestamp(
          data?.notificationMetadata?.proposedEffectiveDate,
        );
        break;
      case "applicationEndpoint":
        returnObject["applicationEndpoint"] =
          process.env.applicationEndpoint ?? "missing data";
        break;
      case "formattedFileList":
        returnObject["formattedFileList"] = formatAttachments(
          "html",
          data.attachments,
        );
        break;
      case "textFileList":
        returnObject["textFileList"] = formatAttachments(
          "text",
          data.attachments,
        );
        break;
      case "ninetyDaysDate":
        returnObject["ninetyDaysDate"] = formatNinetyDaysDate(
          data,
          lookupValues,
        );
        break;
      case "submitter":
        returnObject["submitter"] =
          data.submitterEmail === "george@example.com"
            ? `"George's Substitute" <mako.stateuser@gmail.com>`
            : `"${data.submitterName}" <${data.submitterEmail}>`;
        break;
      case "actionType":
        returnObject["actionType"] =
          actionTypeLookup[data.seaActionType as any] ?? "Waiver";
        break;
      case "osgEmail":
      case "chipInbox":
      case "chipCcList":
      case "dpoEmail":
      case "dmcoEmail":
      case "dhcbsooEmail":
        returnObject[dataType] =
          process.env[dataType] ??
          `'${dataType} Substitute' <mako.stateuser@gmail.com>`;
        break;
      default:
        returnObject[dataType] =
          data[dataType] ?? lookupValues[dataType] ?? "missing data";
        break;
    }
  });
  console.log(
    "buildEmailData returnObject: ",
    JSON.stringify(returnObject, null, 4),
  );
  return returnObject;
};
