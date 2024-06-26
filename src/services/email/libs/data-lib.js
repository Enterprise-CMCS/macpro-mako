import { DateTime } from "luxon";

import { getLookupValues } from "./lookup-lib";
import { attachmentTitleMap } from "shared-types";

const actionTypeLookup = {
  New: "Initial Waiver",
  Amend: "Waiver Amendment",
  Renew: "Waiver Renewal",
};

const formatAttachments = (formatType, attachmentList) => {
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
    return `${format.begin}${attachmentFormat.join(format.joiner)}${format.end}`;
  }
    
};

const formatDateFromTimestamp = (timestamp) => {
  if (!timestamp || timestamp <= 0) return "Pending";
  return DateTime.fromMillis(timestamp).toFormat("DDDD");
};

function formatNinetyDaysDate(data, lookupValues) {
  if (lookupValues?.ninetyDaysDate)
    return formatDateFromTimestamp(lookupValues?.ninetyDaysDate);
  if (!data?.notificationMetadata?.submissionDate) return "Pending";
  return DateTime.fromMillis(data.notificationMetadata.submissionDate)
    .plus({ days: 90 })
    .toFormat("DDDD '@ 11:59pm ET'");
}

export const buildEmailData = async (bundle, data) => {
  const returnObject = {};

  const lookupValues = await getLookupValues(bundle.lookupList, data.id);

  if (
    !bundle.dataList ||
    !Array.isArray(bundle.dataList) ||
    bundle.dataList.length === 0
  )
    return { error: "init statement fail", bundle, data, lookupValues };

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
        returnObject["applicationEndpoint"] = process.env.applicationEndpoint;
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
            ? // eslint-disable-next-line quotes
              '"George\'s Substitute" <mako.stateuser@gmail.com>'
            : `"${data.submitterName}" <${data.submitterEmail}>`;
        break;
      case "actionType":
        returnObject["actionType"] =
          actionTypeLookup[data.seaActionType] ?? "Waiver";
        break;
      case "osgEmail":
      case "chipInbox":
      case "chipCcList":
      case "dpoEmail":
      case "dmcoEmail":
      case "dhcbsooEmail":
        returnObject[dataType] = process?.env[dataType]
          ? process.env[dataType]
          : `'${dataType} Substitute' <mako.stateuser@gmail.com>`;
        break;

      default:
        returnObject[dataType] = data[dataType]
          ? data[dataType]
          : lookupValues[dataType]
            ? lookupValues[dataType]
            : "missing data";
        break;
    }
  });
  console.log(
    "buildEmailData returnObject: ",
    JSON.stringify(returnObject, null, 4),
  );
  return returnObject;
};
