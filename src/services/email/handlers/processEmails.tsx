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
const createSendTemplatedEmailCommand = (data) =>
  new SendTemplatedEmailCommand({
    Source: process.env.emailSource ?? "kgrue@fearless.tech",
    Destination: {
      ToAddresses: data.ToAddresses,
      CcAddresses: data.CcAddresses,
    },
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
  // turn all string address lists into array elements
  for (const address in addressList) {
    let mappedAddress = address;
    if (address === "submitterEmail")
      if (data.submitterEmail === "george@example.com")
        mappedAddress = `"George's Substitute" <k.grue.stateuser@gmail.com>`;
      else
        mappedAddress = `"${data.submitterName}" <${data.submitterEmail}>`;
    if (address === "osgEmail")
      mappedAddress = process?.env?.osgEmail ? process.env.osgEmail : "'OSG Substitute' <k.grue@theta-llc.com>";
    if (address === "cpocEmail")
      mappedAddress = data?.cpocEmail ? data.cpocEmail : "'CPOC Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>";

    const extraAddresses = mappedAddress.split(';');
    extraAddresses.forEach((address) => {
      newList.push(address);
    })
  }
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
    if (osInsightsItem) return "'CPOC Insights' <k.grue.cmsapprover@gmail.com>;'SRT Insights' <k.grue.stateadmn@gmail.com>";
    return "'CPOC Substitute' <k.grue.cmsapprover@gmail.com>;'SRT 1' <k.grue.stateadmn@gmail.com>";
  } catch (error) {
    console.log("OpenSearch error is: ", error);
  }
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

  // build the email commands
  bundlePromises.forEach((lookupResult) => {
    if (lookupResult.status !== "fulfilled") return;
    const emailBundle = lookupResult.value;

    if (emailBundle.TemplateDataList && Array.isArray(emailBundle.TemplateDataList) && emailBundle.TemplateDataList.length !== 0) {
      emailBundle.TemplateData = emailBundle.TemplateDataList.map((dataType) => {
        if (dataType === 'territory') return { "territory": emailBundle.id.toString().substring(0, 2) };
        if (dataType === 'proposedEffectiveDateNice') return { "proposedEffectiveDateNice": formatProposedEffectiveDate(emailBundle) }
        if (dataType === 'applicationEndpoint') return { "applicationEndoint": process.env.applicationEndpoint };
        if (dataType === 'fomattedFileList') return { "fomattedFileList": formatAttachments("html", emailBundle.attachments) };
        if (dataType === 'textFileList') return { "textFileList": formatAttachments("text", emailBundle.attachments) };

        if (!!emailBundle[dataType]) return { [dataType]: emailBundle[dataType] };
        return { [dataType]: "not sure about this one" };
      });
      console.log("TemplateDataList: ", emailBundle.TemplateDataList);
    }

    // data is at bundle level, but needs to be available for each command
    const templateDataString = emailBundle?.TemplateData ? JSON.stringify(emailBundle.TemplateData) : [{ "here": "is dummy data" }];
    console.log("templateData is: ", templateDataString);
    emailBundle.emailCommands.forEach((command) => {
      command.TemplateData = templateDataString;
      command.Destination = { ToAddresses: buildAddressList(command.ToAddresses, emailBundle) };
      const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(command);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));

      emailQueue.push({ ...sendTemplatedEmailCommand });
    })
  });
  console.log("email queue: ", emailQueue);

  // send the emails
  const sendResults = await Promise.all(emailQueue.map(async (email) => {
    try {
      return await SES.send(email);
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(email, null, 4));
      return Promise.resolve(err);
    }
  }));

  console.log("the sendResults are: ", sendResults);
  return sendResults;
}