const getBundleFromEvent = (configKey, stage) => {
    switch (configKey) {
        case "new-submission-medicaid-spa":
            return {
                "dataList": ["osgEmail", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `new-submission-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail"],
                },
                {
                    "Template": `new-submission-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["submitter"],
                },
                ]
            };
        case "respond-to-rai-medicaid-spa":
            return {
                "lookupList": ["osInsights"],
                "dataList": ["osgEmail", "cpoc", "srt", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysLookupNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `respond-to-rai-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail", "cpoc", "srt"],
                },
                {
                    "Template": `respond-to-rai-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["submitter"],
                }],
            };
        case "withdraw-package-medicaid-spa":
            return {
                "lookupList": ["osInsights","cognito"],
                "dataList": ["osgEmail", "dpoEmail", "allState", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysLookupNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `withdraw-package-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail"],
                    "CcAddresses": ["dpoEmail"]
                },
                {
                    "Template": `withdraw-package-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["allState"],
                }],
            };
        case "new-submission-chip-spa":
            return {
                "dataList": ["osgEmail", "chipInbox", "chipCcList", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `new-submission-chip-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail", "chipInbox"],
                    "CcAddresses": ["chipCcList"]
                },
                {
                    "Template": `new-submission-chip-spa-state_${stage}`,
                    "ToAddresses": ["submitter"],
                },
                ]
            };
        case "respond-to-rai-chip-spa":
            return {
                "lookupList": ["osInsights"],
                "dataList": ["osgEmail", "chipInbox", "chipCcList", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysLookupNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `respond-to-rai-chip-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail", "chipInbox"],
                    "CcAddresses": ["chipCcList"]
                },
                {
                    "Template": `respond-to-rai-chip-spa-state_${stage}`,
                    "ToAddresses": ["submitter"],
                },
                ]
            };
        default:
            return { message: `no bundle defined for configKey ${configKey}`};
    }
};

const buildKeyFromRecord = (record) => {
    if (record?.origin !== "micro" || !record?.authority) return;

    const actionType = record?.actionType ? record.actionType : "new-submission";

    const authority = record.authority.toLowerCase().replace(/\s+/g, "-");

    return `${actionType}-${authority}`;
}

export const getBundle = (record, stage) => {
    const configKey = buildKeyFromRecord(record);

    return getBundleFromEvent(configKey, stage);
}