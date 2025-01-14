import { Waiver1915bStateEmail } from "../../../content/new-submission/emailTemplates/Waiver1915bState";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        attachments: {
          bCapWaiverApplication: {
            label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
            files: [
              {
                filename: "capitated-waiver-application.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
              {
                filename: "capitated-waiver-application-2.pdf",
                title: "capitated-waiver-supporting-evidence.pdf",
                bucket: "test",
                key: "test2",
                uploadDate: Date.now(),
              },
            ],
          },
          bCapCostSpreadsheets: {
            label: "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
            files: [
              {
                filename: "capitated-waiver-cost-effectiveness-spreadsheet.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
            ],
          },
          tribalConsultation: { label: "Tribal Consultation", files: [] },
          other: { label: "Other", files: [] },
        },
        event: "capitated-initial",
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "New",
      }}
    />
  );
};
// export const Waiver1915bStateCapitatedRenewalEmailPreview = () => {
//   return (
//     <Waiver1915bStateEmail
//       variables={{
//         ...emailTemplateValue,
//         waiverNumber: "CO-1234.R21.00",
//         attachments: {
//           bCapIndependentAssessment: {
//             label: "1915(b) Comprehensive (Capitated) Waiver Independent Assessment",
//             files: [
//               {
//                 filename: "capitated-waiver-independent-assessment.pdf",
//                 title: "test.pdf",
//                 bucket: "test",
//                 key: "test",
//                 uploadDate: Date.now(),
//               },
//             ],
//           },
//           bCapWaiverApplication: {
//             label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
//             files: [
//               {
//                 filename: "capitated-waiver-application.pdf",
//                 title: "test.pdf",
//                 bucket: "test",
//                 key: "test",
//                 uploadDate: Date.now(),
//               },
//               {
//                 filename: "capitated-waiver-application-2.pdf",
//                 title: "capitated-waiver-supporting-evidence.pdf",
//                 bucket: "test",
//                 key: "test2",
//                 uploadDate: Date.now(),
//               },
//             ],
//           },
//           bCapCostSpreadsheets: {
//             label: "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
//             files: [
//               {
//                 filename: "capitated-waiver-cost-effectiveness-spreadsheet.pdf",
//                 title: "test.pdf",
//                 bucket: "test",
//                 key: "test",
//                 uploadDate: Date.now(),
//               },
//             ],
//           },
//           tribalConsultation: { label: "Tribal Consultation", files: [] },
//           other: { label: "Other", files: [] },
//         },
//         event: "capitated-renewal",
//         id: "CO-1234.R21.00",
//         authority: "1915(b)",
//         actionType: "Renewal",
//       }}
//     />
//   );
// };
// export const Waiver1915bStateCapitatedAmendmentEmailPreview = () => {
//   return (
//     <Waiver1915bStateEmail
//       variables={{
//         ...emailTemplateValue,
//         waiverNumber: "CO-1234.R21.01",
//         attachments: {
//           bCapWaiverApplication: {
//             label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
//             files: [
//               {
//                 filename: "capitated-waiver-application.pdf",
//                 title: "test.pdf",
//                 bucket: "test",
//                 key: "test",
//                 uploadDate: Date.now(),
//               },
//               {
//                 filename: "capitated-waiver-application-2.pdf",
//                 title: "capitated-waiver-supporting-evidence.pdf",
//                 bucket: "test",
//                 key: "test2",
//                 uploadDate: Date.now(),
//               },
//             ],
//           },
//           bCapCostSpreadsheets: {
//             label: "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
//             files: [
//               {
//                 filename: "capitated-waiver-cost-effectiveness-spreadsheet.pdf",
//                 title: "test.pdf",
//                 bucket: "test",
//                 key: "test",
//                 uploadDate: Date.now(),
//               },
//             ],
//           },
//           tribalConsultation: { label: "Tribal Consultation", files: [] },
//           other: { label: "Other", files: [] },
//         },
//         event: "capitated-amendment",
//         id: "CO-1234.R21.00",
//         authority: "1915(b)",
//         actionType: "Amendment",
//       }}
//     />
//   );
// };
