import { formatActionType } from "shared-utils";

import { WaiversEmailState } from "../../../content/uploadSubsequentDocuments/emailTemplates/Waiver1915BState";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/upload-subsequent-documents";

const Waiver1915bStateEmail = () => {
  return (
    <WaiversEmailState
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        event: "upload-subsequent-documents",
        authority: "1915(b)",
        actionType: formatActionType("Amend"),
        attachments: {
          currentStatePlan: attachments.currentStatePlan,
          amendedLanguage: attachments.amendedLanguage,
          coverLetter: attachments.coverLetter,
          budgetDocuments: attachments.budgetDocuments,
          publicNotice: attachments.publicNotice,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
      }}
    />
  );
};

export default Waiver1915bStateEmail;
