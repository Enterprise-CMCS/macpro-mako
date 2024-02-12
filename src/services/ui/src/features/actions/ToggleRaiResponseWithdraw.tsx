import {
  Navigate,
  useParams,
  Alert,
  LoadingSpinner,
  Button,
} from "@/components";
import { Action, PlanType, opensearch } from "shared-types";
import { FC, useEffect, useMemo } from "react";
import { useSubmissionService, useGetUser } from "@/api";
import { buildActionUrl } from "@/utils";
import { ActionFormIntro, PackageInfo, useModalContext } from "@/features";

export const ToggleRaiResponseWithdraw = ({
  item,
}: {
  item?: opensearch.main.ItemResult;
}) => {
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const authority = item?._source.authority as PlanType;
  const { setCancelModalOpen, setSuccessModalOpen } = useModalContext();
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
