export type EmailAddresses = {
  osgEmail: string[];
  dpoEmail: string[];
  dmcoEmail: string[];
  dhcbsooEmail: string[];
  chipInbox: string[];
  chipCcList: string[];
  sourceEmail: string;
  srtEmails: string[];
  cpocEmail: string[];
};

export interface CommonEmailVariables {
  id: string;
  authority: string;
  authority: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
  allStateUsersEmails?: string[];
  responseDate?: number;
  title?: string;
}

export interface RelatedEventType {
  submitterName: string;
  submitterEmail: string;
}
