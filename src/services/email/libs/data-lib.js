import { DateTime } from "luxon";

import { getLookupValues } from "./lookup-lib";

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
  
export const buildEmailData = async (bundle, data) => {
    const returnObject = {};
    console.log("got bundle and data: ", JSON.stringify(bundle, null,4), data);
  
    const lookupValues = await getLookupValues(bundle.lookupList, record.id);
    console.log("lookupValues: ", lookupValues);
    data = {...data, ...lookupValues};
  
    if (!bundle.TemplateDataList || !Array.isArray(bundle.TemplateDataList) || bundle.TemplateDataList.length === 0)
      return { error: "init statement fail", bundle, data };
  
    console.log("got datalist and data: ", bundle.TemplateDataList, data);
    bundle.TemplateDataList.forEach((dataType) => {
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