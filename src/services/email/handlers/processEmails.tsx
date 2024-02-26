import { DateTime } from "luxon";
import { decode } from "base-64";
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import { KafkaEvent } from "shared-types";
import * as os from "../../../libs/opensearch-lib";

const SES = new SESClient({ region: process.env.region });

const eventToEmailsMapping = {
  "new-submission-medicaid-spa": {
    "TemplateDataList": ["id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
    "emailCommands": [{
      "Template": `new-submission-medicaid-spa-cms_${process.env.stage}`,
      "ToAddresses": ["osgEmail"],
    },
    {
      "Template": `new-submission-medicaid-spa-state_${process.env.stage}`,
      "ToAddresses": ["submitterEmail"],
    },
    ]
  },
  "respond-to-rai-medicaid-spa": {
    "lookupList": ["cpocEmailAndSrtList", "ninetyDaysDateNice"],
    "TemplateDataList": ["id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
    "emailCommands": [{
      "Template": `respond-to-rai-medicaid-spa-cms_${process.env.stage}`,
      "ToAddresses": ["osgEmail", "cpocEmailAndSrtList"],
    },
    {
      "Template": `respond-to-rai-medicaid-spa-state_${process.env.stage}`,
      "ToAddresses": ["submitterEmail"],
    }],
  },
  // "new-submission-chip-spa": [{
  //   "templateBase": "new-submission-chip-spa-cms",
  //   "sendTo": ["chipToEmail"],
  //   "ccList": ["chipCcList"]
  // }, {
  //   "templateBase": "new-submission-chip-spa-state",
  //   "sendTo": ["submitterEmail"],
  // }],
};

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

const decodeRecord = (encodedRecord) => {
  if (!encodedRecord.value) return;
  return { id: decode(encodedRecord.key), ...JSON.parse(decode(encodedRecord.value)) };
};

function formatProposedEffectiveDate(emailBundle) {
  if (!emailBundle?.notificationMetadata?.proposedEffectiveDate) return "Pending";
  return DateTime.fromMillis(emailBundle.notificationMetadata.proposedEffectiveDate)
    .toFormat('DDDD');

}
function buildAddressList(addressList, data) {
  const newList: any[] = [];
  console.log("address list and data in: ", addressList, data);
  addressList.forEach( (address) => {
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
  console.log("address list: ", newList );
  return newList;
}

const buildKeyFromEventData = (data) => {
  if (data?.origin !== "micro" || !data?.authority) return;

  const actionType = data?.actionType ? data.actionType : "new-submission";

  const authority = data.authority.toLowerCase().replace(/\s+/g, "-");

  return `${actionType}-${authority}`;
}

const getCpocEmailAndSrtList = async (id) => {
  try {
    if (!process.env.osDomain) {
      throw new Error("process.env.osDomain must be defined");
    }

    const osInsightsItem = await os.getItem(
      process.env.osDomain,
      "insights",
      id
    );
    console.log("The OpenSearch Item index Insights for %s is: ", id, JSON.stringify(osInsightsItem, null, 4));
    const cpoc = osInsightsItem?._source?.LEAD_ANALYST ? osInsightsItem._source.LEAD_ANALYST : "LEAD_ANALYST IS null?";
    const srt = osInsightsItem?._source?.ACTION_OFFICERS ? osInsightsItem._source.ACTION_OFFICERS : "ACTION_OFFICERS IS null?";
    console.log("CPOC and SRT are: ", cpoc, srt);
    if (osInsightsItem) return "'CPOC Insights' <k.grue.cmsapprover@gmail.com>;'SRT Insights' <k.grue.stateadmn@gmail.com>";
    return "'CPOC Substitute' <k.grue.cmsapprover@gmail.com>;'SRT 1' <k.grue.stateadmn@gmail.com>";
  } catch (error) {
    console.log("OpenSearch error is: ", error);
  }
};

const buildTemplateData = (dataList,data) => {
  let returnObject;
  if (!dataList || !Array.isArray(dataList) || dataList.length === 0) 
    return { error: "init statement fail", dataList, data};

  dataList.forEach((dataType) => {
    switch (dataType) {
      case 'territory':
        returnObject.territory = data.id.toString().substring(0, 2);
        break;
    case 'proposedEffectiveDateNice':
      returnObject.proposedEffectiveDateNice = formatProposedEffectiveDate(data);
      break;
    case 'applicationEndpoint':
      returnObject.applicationEndoint = process.env.applicationEndpoint;
      break;
    case 'fomattedFileList':
      returnObject.fomattedFileList = formatAttachments("html", data.attachments);
      break;
    case 'textFileList':
      returnObject.textFileList = formatAttachments("text", data.attachments);
    default:
      if (!!data[dataType]) 
      returnObject[dataType] = data[dataType];
    }});
  console.log("returnObject: ", returnObject);
  return returnObject;
};

export const main = async (event: KafkaEvent) => {
  console.log("Received event (stringified):", JSON.stringify(event, null, 4));

  const bundleQueue: any[] = [];
  const emailQueue: any[] = [];

  // create emailQueue out of emailable events paired with configs
  Object.values(event.records).forEach((source) =>
    source.forEach((record) => {
      const eventData = decodeRecord(record);
      console.log("eventData: ", eventData);
      if (!eventData) return;

      const configKey = buildKeyFromEventData(eventData);
      console.log("configKey: ", configKey);
      if (!configKey) return;

      const emailBundle = eventToEmailsMapping[configKey];
      console.log("emailBundle: ", emailBundle);
      if (!emailBundle) return;
      bundleQueue.push({ ...eventData, ...emailBundle });
    })
  );

  console.log("bundleQueue: ", JSON.stringify(bundleQueue, null, 4));
  // don't bother continuing if there are no emails to send
  if (bundleQueue.length === 0) return;

  // every bundle has the potential to have lookups, async lookups must complete before we
  // can build the emails
  const bundlePromises = await Promise.allSettled(bundleQueue.map(async (bundle) => {
    if (!bundle?.lookupList || !Array.isArray(bundle.lookupList) || bundle.lookupList.length === 0) return bundle;

    if (bundle.lookupList.includes("cpocEmailAndSrtList")) {
      bundle.cpocEmailAndSrtList = await getCpocEmailAndSrtList(bundle.id);
    }

    if (bundle.lookupList.includes("allStateSubmitters")) {
      bundle.allStateSubmitters = "'State 1' <k.grue.stateuser@gmail.com>;'State 2' <k.grue.stateadmn@gmail.com>";
    }
    return bundle;
  }))
  console.log("bundlePromises: ", bundlePromises);
  // if any events need a user list from Cognito

  // build the email command structures
  bundlePromises.forEach((lookupResult) => {
    if (lookupResult.status !== "fulfilled") return;
    const emailBundle = lookupResult.value;

    emailBundle.TemplateData = buildTemplateData(emailBundle.TemplateDataList, emailBundle);


    // data is at bundle level, but needs to be available for each command
    emailBundle.emailCommands.forEach((command) => {
      console.log("the command to start is: ", command);
      command.TemplateData = JSON.stringify(emailBundle.TemplateData);
      command.Destination = { ToAddresses: buildAddressList(command.ToAddresses, emailBundle) };
      if (command?.CcAddresses) command.Destination.CcAddresses = buildAddressList(command.CcAddresses, emailBundle);
      console.log("the command being built is: ", command);
      const sendTemplatedEmailCommand = createSendTemplatedEmailCommandInput(command);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));

      emailQueue.push({ ...sendTemplatedEmailCommand });
    })
  });
  console.log("email queue: ", emailQueue);

  // send the emails
  const sendResults = await Promise.all(emailQueue.map(async (email) => {
    try {
      const TemplatedEmailCommand = new SendTemplatedEmailCommand(email);
      console.log("TemplatedEmailCommand: ", TemplatedEmailCommand);
      return await SES.send(TemplatedEmailCommand);
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(email, null, 4));
      return Promise.resolve(err);
    }
  }));

  console.log("the sendResults are: ", sendResults);
  return sendResults;
}