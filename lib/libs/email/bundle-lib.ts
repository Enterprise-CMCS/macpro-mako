import { Action } from "shared-types";
import { DecodedRecord } from "./handler-lib";

interface EmailCommand {
  Template: string;
  ToAddresses: string[];
  CcAddresses?: string[];
  BccAddresses?: string[];
}

interface Bundle {
  lookupList?: string[];
  dataList: string[];
  emailCommands: EmailCommand[];
}

export interface Record {
  origin?: string;
  authority?: string;
  actionType?: string;
  seaActionType?: string;
}

const getBundleFromEvent = (
  configKey: string,
  stage: string,
): Bundle | { message: string } => {
  switch (configKey) {
    case "new-submission-medicaid-spa":
      return {
        dataList: [
          "osgEmail",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "proposedEffectiveDateNice",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `new-submission-medicaid-spa-cms_${stage}`,
            ToAddresses: ["osgEmail"],
          },
          {
            Template: `new-submission-medicaid-spa-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "new-submission-1915b":
      return {
        dataList: [
          "osgEmail",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "authority",
          "actionType",
          "proposedEffectiveDateNice",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `new-submission-1915b-cms_${stage}`,
            ToAddresses: ["osgEmail"],
          },
          {
            Template: `new-submission-1915b-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "respond-to-rai-1915b":
      return {
        lookupList: ["osInsights"],
        dataList: [
          "osgEmail",
          "cpoc",
          "srt",
          "dmcoEmail",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "authority",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `respond-to-rai-1915b-cms_${stage}`,
            ToAddresses: ["osgEmail", "cpoc", "srt", "dmcoEmail"],
          },
          {
            Template: `respond-to-rai-1915b-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "withdraw-package-1915b":
      return {
        lookupList: ["osInsights", "cognito"],
        dataList: [
          "allState",
          "osgEmail",
          "cpoc",
          "srt",
          "id",
          "territory",
          "submitterName",
          "submitterEmail",
          "additionalInformation",
        ],
        emailCommands: [
          {
            Template: `withdraw-package-1915b-cms_${stage}`,
            ToAddresses: ["osgEmail", "cpoc", "srt"],
          },
          {
            Template: `withdraw-package-1915b-state_${stage}`,
            ToAddresses: ["allState"],
          },
        ],
      };
    case "respond-to-rai-medicaid-spa":
      return {
        lookupList: ["osInsights"],
        dataList: [
          "osgEmail",
          "cpoc",
          "srt",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "proposedEffectiveDateNice",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `respond-to-rai-medicaid-spa-cms_${stage}`,
            ToAddresses: ["osgEmail", "cpoc", "srt"],
          },
          {
            Template: `respond-to-rai-medicaid-spa-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "withdraw-rai-medicaid-spa":
      return {
        lookupList: ["osInsights", "cognito", "osMain"],
        dataList: [
          "cpoc",
          "srt",
          "dpoEmail",
          "osgEmail",
          "allState",
          "id",
          "territory",
          "submitterName",
          "submitterEmail",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
          "initialSubmitterName",
          "initialSubmitterEmail",
        ],
        emailCommands: [
          {
            Template: `withdraw-rai-medicaid-spa-cms_${stage}`,
            ToAddresses: ["cpoc", "srt", "dpoEmail", "osgEmail"],
          },
          {
            Template: `withdraw-rai-medicaid-spa-state_${stage}`,
            ToAddresses: ["allState"],
          },
        ],
      };
    case "withdraw-package-medicaid-spa":
      return {
        lookupList: ["osInsights", "cognito"],
        dataList: [
          "osgEmail",
          "dpoEmail",
          "allState",
          "id",
          "territory",
          "submitterName",
          "submitterEmail",
          "additionalInformation",
        ],
        emailCommands: [
          {
            Template: `withdraw-package-medicaid-spa-cms_${stage}`,
            ToAddresses: ["osgEmail"],
            CcAddresses: ["dpoEmail"],
          },
          {
            Template: `withdraw-package-medicaid-spa-state_${stage}`,
            ToAddresses: ["allState"],
          },
        ],
      };
    case "new-submission-chip-spa":
      return {
        dataList: [
          "osgEmail",
          "chipInbox",
          "chipCcList",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "proposedEffectiveDateNice",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `new-submission-chip-spa-cms_${stage}`,
            ToAddresses: ["osgEmail", "chipInbox"],
            CcAddresses: ["chipCcList"],
          },
          {
            Template: `new-submission-chip-spa-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "respond-to-rai-chip-spa":
      return {
        lookupList: ["osInsights"],
        dataList: [
          "osgEmail",
          "chipInbox",
          "chipCcList",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "proposedEffectiveDateNice",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `respond-to-rai-chip-spa-cms_${stage}`,
            ToAddresses: ["osgEmail", "chipInbox"],
            CcAddresses: ["chipCcList"],
          },
          {
            Template: `respond-to-rai-chip-spa-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "withdraw-rai-chip-spa":
      return {
        lookupList: ["osInsights", "cognito", "osMain"],
        dataList: [
          "chipInbox",
          "cpoc",
          "srt",
          "chipCcList",
          "allState",
          "submitter",
          "id",
          "territory",
          "submitterName",
          "submitterEmail",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
          "initialSubmitterName",
          "initialSubmitterEmail",
        ],
        emailCommands: [
          {
            Template: `withdraw-rai-chip-spa-cms_${stage}`,
            ToAddresses: ["chipInbox", "cpoc", "srt"],
            CcAddresses: ["chipCcList"],
          },
          {
            Template: `withdraw-rai-chip-spa-state_${stage}`,
            ToAddresses: ["allState"],
          },
        ],
      };
    case "withdraw-package-chip-spa":
      return {
        lookupList: ["osInsights", "cognito"],
        dataList: [
          "chipInbox",
          "cpoc",
          "srt",
          "chipCcList",
          "allState",
          "id",
          "territory",
          "submitterName",
          "submitterEmail",
          "additionalInformation",
        ],
        emailCommands: [
          {
            Template: `withdraw-package-chip-spa-cms_${stage}`,
            ToAddresses: ["chipInbox", "cpoc", "srt"],
            CcAddresses: ["chipCcList"],
          },
          {
            Template: `withdraw-package-chip-spa-state_${stage}`,
            ToAddresses: ["allState"],
          },
        ],
      };
    case "new-submission-1915c":
      return {
        dataList: [
          "osgEmail",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "authority",
          "appkTitle",
          "proposedEffectiveDateNice",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `new-submission-1915c-cms_${stage}`,
            ToAddresses: ["osgEmail"],
          },
          {
            Template: `new-submission-1915c-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "temporary-extension-1915b":
    case "temporary-extension-1915c":
      return {
        dataList: [
          "osgEmail",
          "submitter",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "authority",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
        ],
        emailCommands: [
          {
            Template: `temporary-extension-cms_${stage}`,
            ToAddresses: ["osgEmail"],
          },
          {
            Template: `temporary-extension-state_${stage}`,
            ToAddresses: ["submitter"],
          },
        ],
      };
    case "withdraw-rai-1915b":
      return {
        lookupList: ["osInsights", "cognito", "osMain"],
        dataList: [
          "osgEmail",
          "dmcoEmail",
          "cpoc",
          "srt",
          "allState",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "authority",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
          "initialSubmitterName",
          "initialSubmitterEmail",
        ],
        emailCommands: [
          {
            Template: `withdraw-rai-1915b-cms_${stage}`,
            ToAddresses: ["cpoc", "srt", "dmcoEmail", "osgEmail"],
          },
          {
            Template: `withdraw-rai-1915b-state_${stage}`,
            ToAddresses: ["allState"],
          },
        ],
      };
    case "withdraw-rai-1915c":
      return {
        lookupList: ["osInsights", "cognito", "osMain"],
        dataList: [
          "osgEmail",
          "dhcbsooEmail",
          "cpoc",
          "srt",
          "allState",
          "id",
          "applicationEndpoint",
          "territory",
          "submitterName",
          "submitterEmail",
          "authority",
          "ninetyDaysDate",
          "additionalInformation",
          "formattedFileList",
          "textFileList",
          "initialSubmitterName",
          "initialSubmitterEmail",
        ],
        emailCommands: [
          {
            Template: `withdraw-rai-1915c-cms_${stage}`,
            ToAddresses: ["cpoc", "srt", "dhcbsooEmail", "osgEmail"],
          },
        ],
      };
    default:
      return { message: `no bundle defined for configKey ${configKey}` };
  }
};

const buildKeyFromRecord = (record: DecodedRecord): string | undefined => {
  const seaActionTypeLookup: { [key: string]: string } = {
    Extend: Action.TEMP_EXTENSION,
  };

  if (record?.origin !== "micro" || !record?.authority) return;

  // Use action type if present, else check for sea tool action type and translate that, else assume new-submission
  const actionType =
    record?.actionType ??
    seaActionTypeLookup[record.seaActionType as any] ??
    "new-submission";

  // Replace spaces from authority with hyphens and remove parentheses
  const authority = record.authority
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "");

  return `${actionType}-${authority}`;
};

export const getBundle = (record: DecodedRecord, stage: string) => {
  const configKey = buildKeyFromRecord(record) as string;

  return getBundleFromEvent(configKey, stage);
};
