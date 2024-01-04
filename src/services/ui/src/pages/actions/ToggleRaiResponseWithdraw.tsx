import { Navigate, useParams } from "@/components/Routing";
import { Alert, LoadingSpinner } from "@/components";
import { Action, PlanType, ItemResult } from "shared-types";
import { Button } from "@/components/Inputs";
import { useEffect, useMemo } from "react";
import { useSubmissionService } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { useGetUser } from "@/api/useGetUser";
import { ActionFormIntro, PackageInfo } from "@/pages/actions/common";
import { useModalContext } from "@/pages/form/modals";

export const ToggleRaiResponseWithdrawForm = ({
  item,
}: {
  item?: ItemResult;
}) => {
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const authority = item?._source.authority as PlanType;
  const { setSuccessModalOpen, setCancelModalOpen } = useModalContext();

  const { mutate, isLoading, isSuccess, error } = useSubmissionService<{
    id: string;
  }>({
    data: { id: id! },
    endpoint: buildActionUrl(type!),
    user,
    planType: authority,
  });
  const ACTION_WORD = useMemo(
    () => (type === Action.ENABLE_RAI_WITHDRAW ? "Enable" : "Disable"),
    [type]
  );

  useEffect(() => {
    if (isSuccess) setSuccessModalOpen(true);
  }, [isSuccess]);

  if (!item) return <Navigate path={"/dashboard"} />; // Prevents optional chains below
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
    </>
  );
};
