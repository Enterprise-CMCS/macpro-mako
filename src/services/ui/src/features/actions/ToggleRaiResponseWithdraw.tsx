import { useCallback, useEffect, useMemo } from "react";
import { Action, Authority, SEATOOL_STATUS, opensearch } from "shared-types";
import {
  Navigate,
  useNavigate,
  useParams,
  Alert,
  LoadingSpinner,
  Button,
  useModalContext,
  useAlertContext,
} from "@/components";
import { useSubmissionService, useGetUser } from "@/api";
import {
  buildActionUrl,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { ActionFormIntro, PackageInfo } from "@/features";
import { useQuery as useQueryString } from "@/hooks";
import { useSyncStatus } from "@/hooks/useSyncStatus";

export const ToggleRaiResponseWithdraw = ({
  item,
}: {
  item?: opensearch.main.ItemResult;
}) => {
  const urlQuery = useQueryString();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const modal = useModalContext();
  const alert = useAlertContext();
  const originPath = useOriginPath();
  const ACTION_WORD = useMemo(
    () => (type === Action.ENABLE_RAI_WITHDRAW ? "Enable" : "Disable"),
    [type],
  );
  const syncRecord = useSyncStatus({
    path: originPath ? originPath : "/dashboard",
    isCorrectStatus: (data) => {
      const isEnabled = ACTION_WORD === "Enable";
      console.log(data, isEnabled);
      return data._source.raiWithdrawEnabled === isEnabled;
    },
  });
  const acceptAction = useCallback(() => {
    modal.setModalOpen(false);
  }, []);
  const { mutate, isLoading, isSuccess, error } = useSubmissionService<{
    id: string;
  }>({
    data: { id: id! },
    endpoint: buildActionUrl(type!),
    user,
    authority: item?._source.authority as Authority,
  });

  useEffect(() => {
    if (isSuccess) {
      alert.setContent({
        header: `RAI response withdrawal ${ACTION_WORD.toLowerCase()}d`,
        body:
          ACTION_WORD === "Enable"
            ? "The state will be able to withdraw its RAI response. It may take up to a minute for this change to be applied."
            : "The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied.",
      });
      alert.setBannerShow(true);
      alert.setBannerDisplayOn(
        // This uses the originRoute map because this value doesn't work
        // when any queries are added, such as the case of /details?id=...
        urlQuery.get(ORIGIN)
          ? originRoute[urlQuery.get(ORIGIN)! as Origin]
          : "/dashboard",
      );
      console.log("hello world", id);
      syncRecord(id);
    }
  }, [isSuccess]);

  console.log({ isSuccess });

  if (!item) return <Navigate path={"/dashboard"} />; // Prevents optional chains below
  return (
    <>
      {(isLoading || isSuccess) && <LoadingSpinner />}
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
        <Button
          onClick={() => {
            modal.setContent({
              header: "Stop form submission?",
              body: "All information you've entered on this form will be lost if you leave this page.",
              acceptButtonText: "Yes, leave form",
              cancelButtonText: "Return to form",
            });
            modal.setOnAccept(() => acceptAction);
            modal.setModalOpen(true);
          }}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </>
  );
};
