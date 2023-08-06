//import { USER_STATUS, USER_ROLE, RoleEntry } from "cmscommonlib";///
/**
 * Possible user status
 */
type USER_STATUS = {
  PENDING: "pending",
  DENIED: "denied",
  REVOKED: "revoked",
  ACTIVE: "active",
};

export enum USER_ROLE {
  DEFAULT_CMS_USER = "defaultcmsuser",
  STATE_SUBMITTER = "statesubmitter",
  CMS_REVIEWER = "cmsreviewer",
  STATE_SYSTEM_ADMIN = "statesystemadmin",
  CMS_ROLE_APPROVER = "cmsroleapprover",
  SYSTEM_ADMIN = "systemadmin",
  HELPDESK = "helpdesk",
}

export type RoleEntry = {
  role: USER_ROLE;
  status: USER_STATUS;
  territory?: string;
};

export type UserProfile = {
  ismemberof: string;
  cmsRoles: string;
  email: string;
  firstName: string;
  lastName: string;
  userData: UserRecord;
};

export type UserRecord = {
  roleList: RoleEntry[];
  validRoutes?: string[];
  phoneNumber?: string;
  fullName: string;
  effRole?: string;
  effStatus?: string;
};

export type AccessHistoryEvent = {
  date: number;
  status: string;
};

export type StateAccessAttribute = {
  stateCode: string;
  history: AccessHistoryEvent[];
};

export type AppContextValue = {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isLoggedInAsDeveloper: boolean;
  userProfile: Partial<UserProfile>;
  userRole: USER_ROLE | null;
  userStatus: USER_STATUS | null;
  activeTerritories: string[] | null;
  setUserInfo: (isDeveloper?: boolean) => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  confirmAction: (
    heading: string,
    acceptText: string,
    cancelText: string,
    message: JSX.Element | string,
    onAccept?: any,
    onDeny?: any
  ) => Promise<void>;
};

export type PackageRowValue = {
  componentId: string;
  componentType: string;
  packageStatus: string;
  submissionTimestamp: number;
  submitter: string;
  territory: string;
};

export type LocationState = {
  passCode?: string;
};

export enum FORM_SOURCE {
  PACKAGE_LIST = "packageList",
  DETAIL = "detail",
}

export type FormLocationState = {
  parentId?: string;
  parentType?: string;
  componentId?: string;
  formSource?: FORM_SOURCE;
  temporaryExtensionType?: string;
};
