import { getApprovingRole, newUserRoleMap } from "shared-utils";

import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { SelfRevokeAcess } from "@/features";
import { convertStateAbbrToFullName } from "@/utils";

interface ModalProps {
  open: boolean;
  selfRevokeRole: SelfRevokeAcess | null;
  onAccept: () => void;
  onCancel: () => void;
}

const LegacyWithdrawRoleModal = ({ open, selfRevokeRole, onAccept, onCancel }: ModalProps) => (
  <ConfirmationDialog
    open={open}
    title="Withdraw State Access?"
    body={`This action cannot be undone. ${convertStateAbbrToFullName(
      selfRevokeRole.territory,
    )} State System Admin will be notified.`}
    aria-labelledby="Self Revoke Access Modal"
    acceptButtonText="Confirm"
    onAccept={onAccept}
    onCancel={onCancel}
  />
);

const WithdrawPendingRoleModal = ({ open, onAccept, onCancel }: ModalProps) => (
  <ConfirmationDialog
    open={open}
    title="Withdraw role request?"
    body="This role is still pending approval. Withdrawing it will cancel your request."
    aria-labelledby="Self Withdraw Pending Access Modal"
    acceptButtonText="Withdraw request"
    onAccept={onAccept}
    onCancel={onCancel}
  />
);

const RemoveActiveRoleModal = ({ open, selfRevokeRole, onAccept, onCancel }: ModalProps) => {
  const approvingRole = getApprovingRole(selfRevokeRole.role);
  const stateDisplay =
    selfRevokeRole.role === "statesubmitter"
      ? `${convertStateAbbrToFullName(selfRevokeRole.territory)} `
      : "";
  return (
    <ConfirmationDialog
      open={open}
      title={
        <div className="mr-4">
          Withdraw {stateDisplay}
          {newUserRoleMap[selfRevokeRole.role]} access?
        </div>
      }
      body={`This action cannot be undone. The ${stateDisplay}${newUserRoleMap[approvingRole]} will be notified of this change.`}
      aria-labelledby="Self Remove Role Modal"
      acceptButtonText="Confirm"
      onAccept={onAccept}
      onCancel={onCancel}
    />
  );
};

export const WithdrawRoleModal = (props: ModalProps) => {
  const modalType = (function () {
    if (!props.selfRevokeRole) return null;
    if (!props.selfRevokeRole.isNewUserRoleDisplay) return "legacy-withdraw";
    if (props.selfRevokeRole.status === "pending") return "pending-withdraw";
    if (props.selfRevokeRole.status === "active") return "remove-role";
  })();

  if (!props.selfRevokeRole) return;
  return (
    <>
      {modalType === "legacy-withdraw" && <LegacyWithdrawRoleModal {...props} />}
      {modalType === "pending-withdraw" && <WithdrawPendingRoleModal {...props} />}
      {modalType === "remove-role" && <RemoveActiveRoleModal {...props} />}
    </>
  );
};
