import { IPackageCheck } from "shared-utils";
import { CognitoUserAttributes } from "./user";

export enum Action {
  UPLOAD_SUBSEQUENT_DOCUMENTS = "upload-subsequent-documents",
  RESPOND_TO_RAI = "respond-to-rai",
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
  DISABLE_RAI_WITHDRAW = "disable-rai-withdraw",
  REMOVE_APPK_CHILD = "remove-appk-child",
  TEMP_EXTENSION = "temporary-extension",
  AMEND_WAIVER = "amend-waiver",
  UPDATE_ID = "update-id",
  LEGACY_ADMIN_CHANGE = "legacy-admin-change",
  LEGACY_WITHDRAW_RAI_REQUEST = "legacy-withdraw-rai-request",
  WITHDRAW_RAI = "withdraw-rai",
  WITHDRAW_PACKAGE = "withdraw-package",
}

export type ActionRule = {
  action: Action;
  check: (
    checker: IPackageCheck,
    user: CognitoUserAttributes,
    /** Keep excess parameters to a minimum **/
    ...any: any[]
  ) => boolean;
};
