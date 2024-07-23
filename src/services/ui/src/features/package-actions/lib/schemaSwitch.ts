import { Action, SeatoolAuthority } from "shared-types";
import { ZodEffects, ZodObject, ZodRawShape, ZodType } from "zod";
import {
  bWaiverRaiSchema,
  chipSpaRaiSchema,
  chipWithdrawPackageSchema,
  defaultIssueRaiSchema,
  defaultTempExtSchema,
  defaultWithdrawPackageSchema,
  defaultWithdrawRaiSchema,
  medSpaRaiSchema,
  defaultCompleteIntakeSchema,
  defaultUpdateIdSchema,
} from "@/features/package-actions/lib/modules";

type Schema = ZodObject<ZodRawShape> | ZodEffects<ZodType>;
type SchemaGroup = Partial<Record<SeatoolAuthority, Schema | null>>;

const issueRaiFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultIssueRaiSchema,
  [SeatoolAuthority.MedicaidSPA]: defaultIssueRaiSchema,
  [SeatoolAuthority["1915b"]]: defaultIssueRaiSchema,
  [SeatoolAuthority["1915c"]]: defaultIssueRaiSchema,
};

const respondToRaiFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: chipSpaRaiSchema,
  [SeatoolAuthority.MedicaidSPA]: medSpaRaiSchema,
  [SeatoolAuthority["1915b"]]: bWaiverRaiSchema,
  [SeatoolAuthority["1915c"]]: bWaiverRaiSchema,
};

const enableRaiWithdrawFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: null,
  [SeatoolAuthority.MedicaidSPA]: null,
  [SeatoolAuthority["1915b"]]: null,
  [SeatoolAuthority["1915c"]]: null,
};

const disableRaiWithdrawFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: null,
  [SeatoolAuthority.MedicaidSPA]: null,
  [SeatoolAuthority["1915b"]]: null,
  [SeatoolAuthority["1915c"]]: null,
};

const withdrawRaiFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultWithdrawRaiSchema,
  [SeatoolAuthority.MedicaidSPA]: defaultWithdrawRaiSchema,
  [SeatoolAuthority["1915b"]]: defaultWithdrawRaiSchema,
  [SeatoolAuthority["1915c"]]: defaultWithdrawRaiSchema,
};

const withdrawPackageFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: chipWithdrawPackageSchema,
  [SeatoolAuthority.MedicaidSPA]: defaultWithdrawPackageSchema,
  [SeatoolAuthority["1915b"]]: defaultWithdrawPackageSchema,
  [SeatoolAuthority["1915c"]]: defaultWithdrawPackageSchema,
};

const tempExtensionFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultTempExtSchema,
  [SeatoolAuthority.MedicaidSPA]: defaultTempExtSchema,
  [SeatoolAuthority["1915b"]]: defaultTempExtSchema,
  [SeatoolAuthority["1915c"]]: defaultTempExtSchema,
};

const updateIdFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultUpdateIdSchema,
  [SeatoolAuthority.MedicaidSPA]: defaultUpdateIdSchema,
  [SeatoolAuthority["1915b"]]: defaultUpdateIdSchema,
  [SeatoolAuthority["1915c"]]: defaultUpdateIdSchema,
};

const completeIntakeFor: SchemaGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultCompleteIntakeSchema,
  [SeatoolAuthority.MedicaidSPA]: defaultCompleteIntakeSchema,
  [SeatoolAuthority["1915b"]]: defaultCompleteIntakeSchema,
  [SeatoolAuthority["1915c"]]: defaultCompleteIntakeSchema,
};

export const getSchemaFor = (a: Action, p: SeatoolAuthority): Schema | null => {
  const actionSchemaMap: Record<string, SchemaGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "enable-rai-withdraw": enableRaiWithdrawFor,
    "disable-rai-withdraw": disableRaiWithdrawFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };

  const group = actionSchemaMap[a];
  if (group === undefined) {
    throw new Error(`No schema group for "${a}"`);
  }

  const schema = group[p];
  if (schema === undefined) {
    throw new Error(`No schema for "${p}" found in group "${a}`);
  }

  return schema;
};
