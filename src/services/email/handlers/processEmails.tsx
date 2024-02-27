import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { DateTime } from "luxon";

import { KafkaRecord } from "shared-types";

import handler from "../libs/handler-lib";
import { getBundle } from "../libs/bundle-lib";
import { getOsInsightData } from "../libs/os-lib";
import { getCognitoData } from "../libs/cognito-lib";

const SES = new SESClient({ region: process.env.region });

const formatAttachments = (formatType, attachmentList) => {
  console.log("got attachments for format: ", attachmentList, formatType);
  const formatChoices = {
    "text": {
      begin: "\n\n",
      joiner: "\n",
      end: "\n\n"
    },
    "html": {
      begin: "<ul><li>",
      joiner: "</li><li>",
      end: "</li></ul>"
    },
  };
  const format = formatChoices[formatType];
  if (!format) {
    console.log("new format type? ", formatType);
    return "attachment List";
  }
  if (!attachmentList || attachmentList.length === 0)
    return "no attachments";
  else
    return `${format.begin}${attachmentList.map(a => `${a.title}: ${a.filename}`).join(format.joiner)}${format.end}`;
}
const createSendTemplatedEmailCommandInput = (data) =>
({
  Source: process.env.emailSource ?? "kgrue@fearless.tech",
  Destination: data.Destination,
  TemplateData: data.TemplateData,
  Template: data.Template,
  ConfigurationSetName: process.env.emailConfigSet,
});

function formatProposedEffectiveDate(emailBundle) {
  if (!emailBundle?.notificationMetadata?.proposedEffectiveDate) return "Pending";
  return DateTime.fromMillis(emailBundle.notificationMetadata.proposedEffectiveDate)
    .toFormat('DDDD');

}

function formatNinetyDaysDate(emailBundle) {
  if (!emailBundle?.notificationMetadata?.submissionDate) return "Pending";
  return DateTime.fromMillis(emailBundle.notificationMetadata.submissionDate)
    .plus({ days: 90 })
    .toFormat("DDDD '@ 11:59pm' ET");

}

function buildAddressList(addressList, data) {
  const newList: any[] = [];
  console.log("address list and data in: ", addressList, data);
  addressList.forEach((address) => {
    let mappedAddress = address;
    if (address === "submitterEmail")
      if (data.submitterEmail === "george@example.com")
        mappedAddress = `"George's Substitute" <k.grue.stateuser@gmail.com>`;
      else
        mappedAddress = `"${data.submitterName}" <${data.submitterEmail}>`;
    if (address === "osgEmail")
      mappedAddress = process?.env?.osgEmail ? process.env.osgEmail : "'OSG Substitute' <k.grue@theta-llc.com>";
    if (address === "cpocEmailAndSrtList")
      mappedAddress = data?.cpocEmailAndSrtList ? data.cpocEmailAndSrtList : "'CPOC Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 1 Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 2 Substitute in mapaddress' <k.grue.stateadmn@gmail.com>";

    console.log("mapped address: ", mappedAddress);
    const extraAddresses = mappedAddress.split(';');
    extraAddresses.forEach((oneaddress) => {
      console.log("the individual address: ", oneaddress);
      newList.push(oneaddress);
    })
  });
  console.log("address list: ", newList);
  return newList;
}

const buildTemplateData = (dataList : string[] | undefined , data) => {
  const returnObject = {};

  if (!dataList || !Array.isArray(dataList) || dataList.length === 0)
    return { error: "init statement fail", dataList, data };

  console.log("got datalist and data: ", dataList, data);
  dataList.forEach((dataType) => {
    switch (dataType) {
      case 'territory':
        returnObject['territory'] = data.id.toString().substring(0, 2);
        break;
      case 'proposedEffectiveDateNice':
        returnObject['proposedEffectiveDateNice'] = formatProposedEffectiveDate(data);
        break;
      case 'applicationEndpoint':
        returnObject['applicationEndpoint'] = process.env.applicationEndpoint;
        break;
      case 'formattedFileList':
        returnObject['formattedFileList'] = formatAttachments("html", data.attachments);
        break;
      case 'textFileList':
        returnObject['textFileList'] = formatAttachments("text", data.attachments);
        break;
      case 'ninetyDaysDateNice':
        returnObject['ninetyDaysDateNice'] = formatNinetyDaysDate(data);
        break;
      default:
        returnObject[dataType] = !!data[dataType] ? data[dataType] : "missing data";
        break;
    }
  });
  console.log("returnObject: ", returnObject);
  return returnObject;
};

export const main = handler(async (record: KafkaRecord) => {
  console.log("record: ", record);

  const emailBundle = getBundle(record, process.env.stage);
  console.log("emailBundle: ", JSON.stringify(emailBundle, null, 4));
  if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands) return "no eventToEmailMapping found, no email sent";

  if (emailBundle?.lookupList && !Array.isArray(emailBundle.lookupList) && emailBundle.lookupList.length > 0) {
    const lookupPromises = await Promise.allSettled(emailBundle.lookupList.map(async (lookupType: string) => {
      switch (lookupType) {
        case "osInsights":
          return await getOsInsightData(emailBundle.id);
        case "allStateSubmitters":
          return await getCognitoData(emailBundle.id);
        default:
          return await Promise.resolve(`Don't have function for ${lookupType}`);
      }
    }))
    console.log("lookupPromises: ", lookupPromises);
  }
  emailBundle.TemplateData = buildTemplateData(emailBundle.TemplateDataList, record);

  const sendResults = await Promise.allSettled(emailBundle.emailCommands.map(async (command) => {
    try {
      console.log("the command to start is: ", command);
      command.TemplateData = JSON.stringify(emailBundle.TemplateData);
      command.Destination = { ToAddresses: buildAddressList(command.ToAddresses, emailBundle.TemplateData) };
      if (command?.CcAddresses) command.Destination.CcAddresses = buildAddressList(command.CcAddresses, emailBundle.TemplateData);
      console.log("the command being built is: ", command);
      const sendTemplatedEmailCommand = createSendTemplatedEmailCommandInput(command);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));

      const TemplatedEmailCommand = new SendTemplatedEmailCommand(sendTemplatedEmailCommand);
      console.log("TemplatedEmailCommand: ", JSON.stringify(TemplatedEmailCommand, null, 4));
      return await SES.send(TemplatedEmailCommand);
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(command, null, 4));
      return Promise.resolve(err);
    }
  }));
  console.log("the sendResults are: ", JSON.stringify(sendResults, null, 4));
  return sendResults;
});
