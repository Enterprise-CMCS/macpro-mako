import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingSpinner } from "@/components";
import { ROUTES } from "@/routes";
import { Action, PlanType, ItemResult } from "shared-types";
import { Button } from "@/components/Inputs";
import { useEffect, useMemo, useState } from "react";
import { PackageActionForm } from "@/pages/actions/PackageActionForm";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { useSubmissionService } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { useGetUser } from "@/api/useGetUser";
import { ActionFormIntro, PackageInfo } from "@/pages/actions/common";

const ToggleRaiResponseWithdrawForm = ({ item }: { item?: ItemResult }) => {
  const navigate = useNavigate();
  const { id, type } = useParams<{ id: string; type: Action }>();
  const { data: user } = useGetUser();
  const authority = item?._source.authority as PlanType;
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  const { mutate, isLoading, isSuccess, error } = useSubmissionService<{
    id: string;
  }>({
    data: { id: id! },
    endpoint: buildActionUrl(type!),
    user,
    authority,
  });
  const ACTION_WORD = useMemo(
    () => (type === Action.ENABLE_RAI_WITHDRAW ? "Enable" : "Disable"),
    [type]
  );

  useEffect(() => {
    if (isSuccess) setSuccessModalOpen(true);
  }, [isSuccess]);

  if (!item) return <Navigate to={ROUTES.DASHBOARD} />; // Prevents optional chains below
  return (
    <>
      {isLoading && <LoadingSpinner />}
      <ActionFormIntro
        title={`${ACTION_WORD} Formal RAI Response Withdraw Details`}
      >
        <p>
          {ACTION_WORD === "Enable" &&
            "Once you submit this form, the most recent Formal RAI Response for this package will be able to be withdrawn by the state. "}
          {ACTION_WORD === "Disable" &&
            "Once you submit this form, you will disable the previous Formal RAI Response Withdraw - Enabled action. The State will not be able to withdraw the Formal RAI Response. "}
          <strong>
            If you leave this page, you will lose your progress on this form.
          </strong>
        </p>
      </ActionFormIntro>
      <PackageInfo item={item} />
      {error && (
        <Alert className="mb-4 max-w-2xl" variant="destructive">
          <strong>ERROR {ACTION_WORD}ing RAI Response Withdraw: </strong>
          {error.response.data.message}
        </Alert>
      )}
      <div className="flex gap-2">
        <Button onClick={() => mutate()}>Submit</Button>
        <Button onClick={() => setCancelModalOpen(true)} variant="outline">
          Cancel
        </Button>
      </div>
      {/* Success Modal */}
      <ConfirmationModal
        open={successModalOpen}
        onAccept={() => {
          setSuccessModalOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setSuccessModalOpen(false)} // Should be made optional
        cancelButtonVisible={false} // Should be made optional
        title={`Formal RAI Response Withdraw Successfully ${ACTION_WORD}d`}
        body={
          <p>
            Please be aware that it may take up to a minute for changes to show
            up on the Dashboard and Details pages.
          </p>
        }
        acceptButtonText="Go to Package Details"
      />

      {/* Cancel Modal */}
      <ConfirmationModal
        open={cancelModalOpen}
        onAccept={() => {
          setCancelModalOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setCancelModalOpen(false)}
        cancelButtonText="Return to Form"
        acceptButtonText="Leave Page"
        title="Are you sure you want to cancel?"
        body={
          <p>If you leave this page you will lose your progress on this form</p>
        }
      />
    </>
  );
};

export const ToggleRaiResponseWithdraw = () => (
  <PackageActionForm>
    <ToggleRaiResponseWithdrawForm />
  </PackageActionForm>
);
