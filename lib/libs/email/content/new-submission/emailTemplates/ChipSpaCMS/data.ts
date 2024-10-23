import { Events } from "lib/packages/shared-types";
import { CommonEmailVariables } from "shared-types";

export const emailTemplateValue: Events["NewChipSubmission"] &
  CommonEmailVariables = {
  id: "C0-24-8110",
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  authority: "CHIP SPA",
  timestamp: 1121234556,
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  additionalInformation:
    "Lorem ipsum odor amet, consectetuer adipiscing elit. Vivamus ante natoque mollis molestie blandit facilisi augue. Sagittis mauris a lacus ultrices scelerisque massa. Sem laoreet maximus proin ornare varius feugiat tempor; mollis est. Scelerisque turpis urna; suscipit magna dis posuere. Ultricies viverra quis pellentesque ac tortor. Tortor duis fringilla sapien lobortis porta sem libero tempus metus. Adipiscing mauris pharetra eget montes quis scelerisque quisque suscipit per. Rutrum luctus condimentum et; purus ante massa adipiscing libero morbi.\n\nHabitasse lacus praesent tempor urna magna etiam senectus posuere. Pretium sociosqu magnis eleifend eros maecenas. Cras curae vehicula nunc consequat donec egestas nisi. Praesent conubia id pulvinar, per aenean vulputate fames. Ligula eu ultrices tristique, leo feugiat lacus. Malesuada blandit himenaeos natoque tempor, ligula magna.\n\nSed nulla senectus euismod tincidunt morbi faucibus maecenas efficitur. Orci consequat tempus suscipit himenaeos; dictum laoreet. Augue himenaeos semper, dignissim arcu tempus elit scelerisque. Quis elit porta nascetur elementum sagittis gravida vestibulum turpis massa. Aplatea nam tempus praesent quisque tempus ridiculus. Fames mus primis cras praesent congue. Potenti habitasse maecenas urna donec scelerisque luctus bibendum enim.\n\nFermentum euismod primis non orci porttitor rutrum. Curabitur elementum imperdiet egestas potenti tortor. Nisi posuere donec elit; dui dis lobortis consequat tempor laoreet. Nibh at et iaculis turpis aliquet ultrices inceptos. Erat ante diam egestas justo; mauris volutpat nam. Accumsan nunc etiam a lacinia ad. Malesuada bibendum dictum consequat justo; diam nascetur massa vehicula. Eu platea pulvinar metus nam convallis congue aenean potenti netus.\n\nNisi feugiat erat mauris sed potenti suspendisse diam? Potenti suspendisse finibus ut vestibulum potenti dignissim. Nascetur mauris consequat conubia porta porta imperdiet nisl. Class vel pharetra commodo integer; sit euismod sed. Porttitor penatibus quis ligula donec congue neque ultrices faucibus. Dui eu ut donec elementum imperdiet sollicitudin fringilla.",
  event: "new-chip-submission",
  actionType: "Amend",
  origin: "mako",
  attachments: {
    currentStatePlan: {
      files: [
        {
          filename: "test.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "b545ea14-6b1b-47c0-a374-743fcba4391f.pdf",
          uploadDate: 1728493782785,
        },
      ],
      label: "CMS Form 179",
    },
    amendedLanguage: {
      files: [
        {
          filename: "test1.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
        {
          filename: "test2.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
        {
          filename: "test3.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "SPA Pages",
    },
    coverLetter: {
      files: [
        {
          filename: "cover-leter.pdf",
          title: "test",
          bucket: "mako-outbox-attachments-635052997545",
          key: "f581c0ec-cbb2-4875-a384-86c06136f4c4.pdf",
          uploadDate: 1728493784252,
        },
      ],
      label: "Cover Letter",
    },
    budgetDocuments: {
      label: "Document Demonstrating Good-Faith Tribal Engagement",
    },
    publicNotice: {
      label: "Existing State Plan Page(s)",
    },
    tribalConsultation: {
      label: "Tribal Consultation",
    },
    other: {
      label: "Other",
    },
  },
  proposedEffectiveDate: 1725062400000,
};

export const successfulResponse = {
  $metadata: {
    httpStatusCode: 200,
    requestId: "d1e89223-05e6-4aad-9c7a-c93ac045e2ef",
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0,
  },
  MessageId: "0100019142162cb7-62fb677b-c27e-4ccc-b3d3-20b8776a2605-000000",
};
