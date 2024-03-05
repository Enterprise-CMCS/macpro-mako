import { OneMacUser } from "ui/src/api";
import { Authority, opensearch } from "../../shared-types";

export const testStateCognitoUser: OneMacUser = {
  isCms: false,
  user: {
    sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
    "custom:cms-roles": "onemac-micro-statesubmitter",
    "custom:state": "VA,OH,SC,CO,GA,MD",
    email_verified: true,
    given_name: "State",
    family_name: "Person",
    email: "stateperson@example.com",
  },
};
export const testStateIDMUser: OneMacUser = {
  isCms: testStateCognitoUser.isCms,
  user: {
    ...testStateCognitoUser.user,
    identities:
      '[{"dateCreated":"1709308952587","userId":"abc123","providerName":"IDM","providerType":"OIDC","issuer":null,"primary":"true"}]',
  },
};
export const testCMSCognitoUser: OneMacUser = {
  isCms: true,
  user: {
    sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
    "custom:cms-roles": "onemac-micro-reviewer",
    "custom:state": "VA,OH,SC,CO,GA,MD",
    email_verified: true,
    given_name: "CMS",
    family_name: "Person",
    email: "cmsperson@example.com",
  },
};
export const testCMSIDMUser: OneMacUser = {
  isCms: testCMSCognitoUser.isCms,
  user: {
    ...testCMSCognitoUser.user,
    identities:
      '[{"dateCreated":"1709308952587","userId":"abc123","providerName":"IDM","providerType":"OIDC","issuer":null,"primary":"true"}]',
  },
};
export const testItemResult: opensearch.main.ItemResult = {
  _index: "main",
  _id: "MD-12-3456",
  _version: 4,
  _seq_no: 14206,
  _primary_term: 1,
  found: true,
  _source: {
    id: "MD-12-3456",
    attachments: [
      {
        filename:
          "CMS179 TRANSMITTAL FORM - Home and Community-Based Services, Psychosocial Rehabilitation Services.docx",
        title: "CMS Form 179",
        bucket: "test-bucket",
        key: "test-key",
        uploadDate: 1709319909222,
      },
      {
        filename: "10-20-17 MT 1915(b)(4) Big Sky Waiver app revised (6).docx",
        title: "SPA Pages",
        bucket: "test-bucket",
        key: "test-key",
        uploadDate: 1709319909222,
      },
    ],
    appkParentId: null,
    raiWithdrawEnabled: false,
    additionalInformation: "does the master branch work?!",
    submitterEmail: "george@example.com",
    submitterName: "George Harrison",
    origin: "OneMAC",
    changedDate: "2024-03-01T19:05:09.773Z",
    statusDate: "2024-03-01T00:00:00.000Z",
    subTypeName: null,
    subject: null,
    typeName: null,
    description: null,
    leadAnalystName: null,
    raiReceivedDate: null,
    raiRequestedDate: null,
    leadAnalystOfficerId: null,
    proposedDate: "2024-03-30T00:00:00.000Z",
    state: "MD",
    raiWithdrawnDate: null,
    finalDispositionDate: null,
    stateStatus: "Under Review",
    submissionDate: "2024-03-01T00:00:00.000Z",
    subTypeId: null,
    cmsStatus: "Pending",
    reviewTeam: [],
    flavor: "MEDICAID",
    authorityId: 125,
    initialIntakeNeeded: true,
    authority: "Medicaid SPA" as Authority,
    approvedEffectiveDate: null,
    typeId: null,
    seatoolStatus: "Pending",
    secondClock: false,
    changelog: [
      {
        _index: "changelog",
        _id: "MD-12-3456",
        _score: null,
        // @ts-ignore
        _source: {
          authority: "medicaid spa",
          origin: "micro",
          appkParentId: null,
          additionalInformation: "does the master branch work?!",
          submitterName: "George Harrison",
          submitterEmail: "george@example.com",
          attachments: [
            {
              filename:
                "CMS179 TRANSMITTAL FORM - Home and Community-Based Services, Psychosocial Rehabilitation Services.docx",
              title: "CMS Form 179",
              bucket: "test-bucket",
              key: "test-key",
              uploadDate: 1709319909222,
            },
            {
              filename:
                "10-20-17 MT 1915(b)(4) Big Sky Waiver app revised (6).docx",
              title: "SPA Pages",
              bucket: "test-bucket",
              key: "test-key",
              uploadDate: 1709319909222,
            },
          ],
          raiWithdrawEnabled: false,
          actionType: "new-submission",
          timestamp: "1709319909826",
          id: "MD-12-3456",
          packageId: "MD-12-3456",
        },
        sort: [1709319909826],
      },
    ],
  },
};
