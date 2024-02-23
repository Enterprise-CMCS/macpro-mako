import { DateTime } from "luxon";
import { decode } from "base-64";
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import { KafkaEvent } from "shared-types";
import * as os from "../../../libs/opensearch-lib";

const SES = new SESClient({ region: process.env.region });

const commonTemplateDetails = {
  Source: process.env.emailSource ?? "kgrue@fearless.tech",
  ConfigurationSetName: process.env.emailConfigSet,
};

const defaultPackageDetails = {
  "id": "zz-99-9999",
}

const eventToEmailsMapping = {
  "new-submission-medicaid-spa": {
    "lookupList": [],
    "TemplateDataList": ["id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
    "emailCommands": [{
      "Template": `new-submission-medicaid-spa-cms_${process.env.stage}`,
      "Destination": {
        "ToAddresses": ["osgEmail"],
      }
    },
    {
      "Template": `new-submission-medicaid-spa-state_${process.env.stage}`,
      "Destination": {
        "ToAddresses": ["submitterEmail"],
      }
    },
    ]
  },
  "respond-to-rai-medicaid-spa": [{
    "templateBase": "respond-to-rai-medicaid-spa-cms",
    "sendTo": ["osgEmail", "CPOCEmail", "SRTList"],
  }, {
    "templateBase": "respond-to-rai-medicaid-spa-state",
    "sendTo": ["submitterEmail"],
  }],
  "new-submission-chip-spa": [{
    "templateBase": "new-submission-chip-spa-cms",
    "sendTo": ["chipToEmail"],
    "ccList": ["chipCcList"]
  }, {
    "templateBase": "new-submission-chip-spa-state",
    "sendTo": ["submitterEmail"],
  }],
}
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

const getTemplateDataString = (emailBundle) => {return JSON.stringify({"applicationEndPoint": "theend"})};

const buildKeyFromEventData = (data) => {
  if (data?.origin !== "micro" || !data?.authority) return;

  const actionType = data?.actionType ? data.actionType : "new-submission";

  const authority = data.authority.toLowerCase().replace(/\s+/g, "-");

  return `${actionType}-${authority}`;
}

export const main = async (event: KafkaEvent) => {
  console.log("Received event (stringified):", JSON.stringify(event, null, 4));

  const bundleQueue: any[] = [];
  const emailQueue: any[] = [];
  const packageDetailsLookupList: any[] = [];
  const cognitoDetailsLookupList: any[] = [];
  // go through the records, filter for emailable events, and create email queue
  // perform all lookups
  // build template data for events
  // send emails

  // create the emailQueue out of emailable events paired with configs
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

    }));
  console.log("the packageDetails needed are:", packageDetailsLookupList);
  // don't bother continuing if there are no emails to send
  if (bundleQueue.length === 0) return;

  // if any events need package details from OpenSearch, get them
  let packageDetails: void[] = [];
  if (packageDetailsLookupList.length > 0) {
    packageDetails = await Promise.all(packageDetailsLookupList.map(async (id) => {
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
        if (osInsightsItem) return { ...osInsightsItem.value };
        return { ...defaultPackageDetails };
      } catch (error) {
        console.log("OpenSearch error is: ", error);
      }
    }));
  }
  console.log("package Details: ", packageDetails);

  // if any events need a user list from Cognito

  // build the email commands
  bundleQueue.forEach(async (emailBundle) => {

    if (emailBundle.lookupList && Array.isArray(emailBundle.lookupList) && emailBundle.lookupList.length === 0) {
        // emailBundle.lookupList.foreach(async (lookupType) => {
        //     try {
        //     if (lookupType === "packageDetails")
        //       emailBundle.packageDetails = await getPackageDetails(emailBundle.id);
        //     if (lookupType === "allStateSubmitters")
        //       cognitoDetailsLookupList.push(eventData.id.toString().substring(0, 2));
        //     } catch (e) {
        //         console.log("got error",e);
        //     }
        //   });    
        console.log("lookup list: ", emailBundle.lookupList);
    }

    // data is at bundle level, but needs to be available for each command
    const templateDataString = getTemplateDataString(emailBundle);

    emailBundle.emailCommands.forEach((command) => {
      command.TemplateData = templateDataString;
      const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(command);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));

      emailQueue.push({...sendTemplatedEmailCommand});
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
/*

 
// done with events, then do lookups
// done with lookups, now do data assignments
// data is ready, send emails

emailConfig.forEach(email => {

  email.Command.TemplateData = email.TemplateDataList.map((dataType) => {

  })

  // don't include CcAddresses attribute unless we use it
  if (email?.ccList && email?.ccList.length > 0 && !!email.ccList[0]) {
    email.CcAddresses = email.ccList.map(address => mapAddress(address));
  }

  emailQueue.push(email);
});

function mapAddress(address) {
  if (address === "submitterEmail")
    if (record.submitterEmail === "george@example.com")
      return `"George's Substitute" <k.grue.stateuser@gmail.com>`;
    else
      return `"${record.submitterName}" <${record.submitterEmail}>`;
  return address;
}


function formatSubmissionDate() {
  if (!record?.notificationMetadata?.submissionDate) return "Pending";
  return DateTime.fromMillis(record.notificationMetadata.submissionDate)
    .plus({ days: 90 })
    .toFormat("DDDD '@ 11:59pm ET'");
}

function formatProposedEffectiveDate() {
  if (!record?.notificationMetadata?.proposedEffectiveDate) return "Pending";
  return DateTime.fromMillis(record.notificationMetadata.proposedEffectiveDate)
    .toFormat('DDDD');

}
}));
*/