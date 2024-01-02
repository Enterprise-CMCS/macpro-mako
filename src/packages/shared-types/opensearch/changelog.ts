export type IndexDocumentChangelog = {
  GSI1pk?: string;
  GSI1sk?: string;
  GSI2pk?: string;
  GSI2sk?: string;
  Latest?: number;
  actionType?: string;
  additionalInformation?: string;
  adminChanges: {
    changeType?: string;
    changeMade?: string;
    changeReason?: string;
    changeTimestamp: string;
  }[];
  approvedEffectiveDate?: string;
  attachments: {
    bucket?: string;
    contentType?: string;
    filename?: string;
    key?: string;
    s3key?: string;
    title?: string;
    uploadDate?: string;
    url?: string;
  }[];
  authority: string;
  changedByEmail: string;
  changedByName: string;
  clockEndTimestamp: number;
  componentId: string;
  componentType: string;
  convertTimestamp: number;
  cpocEmail?: string;
  cpocName?: string;
  currentStatus?: string;
  dataFrom?: string;
  date: number;
  description: string;
  division: string;
  doneByEmail: string;
  doneByName: string;
  email: string;
  eventTimestamp: number;
  finalDispositionDate: string;
  fullName: string;
  group: string;
  id: string;
  lastActivityTimestamp: number;
  lastEventTimestamp: number;
  lastModifiedEmail: string;
  lastModifiedName: string;
  latestRaiResponseTimestamp: number;
  notes: string;
  origin: string;
  originallyFrom: string;
  packageId: string;
  parentId: string;
  parentType: string;
  pk: string;
  proposedEffectiveDate: string;
  rairesponses: {
    additionalInformation: string;
    attachments?: {
      contentType?: string;
      keyword?: string;
      s3Key?: string;
      title?: string;
      url?: string;
    }[];
    currentStatus: string;
    eventTimestamp: number;
    submissionTimestamp: number;
  }[];
  raiWithdrawEnabled: boolean;
  reason: string;
  requestedDate: number;
  responseDate: number;
  reverseChron: {
    keyword: string;
    additionalInformation: string;
    attachments?: {
      contentType?: string;
      keyword?: string;
      s3Key?: string;
      title?: string;
      url?: string;
    }[];
    currentStatus: string;
    eventTimestamp: string;
    timestamp: string;
    type: string;
  }[];
  reviewTeam: string;
  reviewTeamEmailList: string;
  role: string;
  sk: string;
  state: string;
  status: string;
  streamUpdateDate: number;
  subStatus: string;
  subject: string;
  submissionTimestamp: number;
  submitterEmail: string;
  submitterName: string;
  temporaryExtensionType: string;
  territory: string;
  timestamp: string;
  title: string;
  transmittalNumberWarningMessage: string;
  waiverAuthority: string;
  withdrawalRequests: {
    properties: {
      additionalInformation: {
        type: "text";
        fields: {
          keyword: {
            type: "keyword";
            ignore_above: 256;
          };
        };
      };
      submissionTimestamp: {
        type: "long";
      };
    };
  };
  withdrawnDate: {
    type: "long";
  };
};
