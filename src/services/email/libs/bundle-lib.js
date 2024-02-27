const getBundleFromEvent = (configKey, stage) => {
    console.log("configKey and stage coming in: ", configKey, stage);
    switch (configKey) {
        case "new-submission-medicaid-spa":
            return {
                "TemplateDataList": ["id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysDateNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `new-submission-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail"],
                },
                {
                    "Template": `new-submission-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["submitterEmail"],
                },
                ]
            };
        case "respond-to-rai-medicaid-spa":
            return {
                "lookupList": ["osInsights"],
                "TemplateDataList": ["id", "applicationEndpoint", "territory", "submitterName", "submitterEmail", "proposedEffectiveDateNice", "ninetyDaysLookupNice", "additionalInformation", "formattedFileList", "textFileList"],
                "emailCommands": [{
                    "Template": `respond-to-rai-medicaid-spa-cms_${stage}`,
                    "ToAddresses": ["osgEmail", "cpocEmailAndSrtList"],
                },
                {
                    "Template": `respond-to-rai-medicaid-spa-state_${stage}`,
                    "ToAddresses": ["submitterEmail"],
                }],
            };
        default:
            return { message: `no bundle defined for configKey ${configKey}`};
    }
s};


// "new-submission-chip-spa": [{
//   "templateBase": "new-submission-chip-spa-cms",
//   "sendTo": ["chipToEmail"],
//   "ccList": ["chipCcList"]
// }, {
//   "templateBase": "new-submission-chip-spa-state",
//   "sendTo": ["submitterEmail"],
// }],

const buildKeyFromRecord = (record) => {
    if (record?.origin !== "micro" || !record?.authority) return;

    const actionType = record?.actionType ? record.actionType : "new-submission";

    const authority = record.authority.toLowerCase().replace(/\s+/g, "-");

    return `${actionType}-${authority}`;
}

export const getBundle = (record, stage) => {
    const configKey = buildKeyFromRecord(record);
    if (!configKey) return "no configKey found, no email sent";
    console.log("configKey is: ", configKey);

    const emailBundle = getBundleFromEvent(configKey, stage);
    console.log("emailBundle being returned is: ", JSON.stringify(emailBundle, null, 4));

    return emailBundle;
}