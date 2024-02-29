const getBundleFromEvent = (configKey, stage) => {
    console.log("configKey and stage coming in: ", configKey, stage);
    switch (configKey) {
        case "new-submission-medicaid-spa":
            return {
                "dataList": ["osg", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `new-submission-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osg"],
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
                "dataList": ["osg", "cpoc", "srt", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysLookupNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `respond-to-rai-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osg", "cpoc", "srt"],
                },
                {
                    "Template": `respond-to-rai-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["submitter"],
                }],
            };
        case "withdraw-package-medicaid-spa":
            return {
                "lookupList": ["osInsights","cognito"],
                "dataList": ["osg", "dpo", "allState", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysLookupNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `withdraw-package-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osg"],
                    "CcAddresses": ["dpo"]
                },
                {
                    "Template": `withdraw-package-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["allState"],
                }],
            };
        case "new-submission-chip-spa":
            return {
                "dataList": ["osg", "chip", "chipCc", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `new-submission-chip-spa-cms_${stage}`,
                    "ToAddresses": ["osg", "chip"],
                    "CcAddresses": ["chipCc"]
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
                "dataList": ["osg", "chip", "chipCc", "submitter", "id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `respond-to-rai-chip-spa-cms_${stage}`,
                    "ToAddresses": ["osg", "chip"],
                    "CcAddresses": ["chipCc"]
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
    if (!configKey) return { message: "no configKey found, no email sent"};

    return getBundleFromEvent(configKey, stage);
}