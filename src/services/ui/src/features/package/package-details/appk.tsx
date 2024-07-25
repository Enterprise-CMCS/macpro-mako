import {
  ConfirmationModal,
  LoadingSpinner,
  Route,
  useAlertContext,
} from "@/components";
import { SEATOOL_STATUS } from "shared-types";
import { useState } from "react";
import * as T from "@/components/Table";
import { Button } from "@/components/Inputs";
import { Undo2 } from "lucide-react";

import { useGetUser } from "@/api/useGetUser";
import { SubmissionServiceParameters, submit } from "@/api/submissionService";
import { useMutation } from "@tanstack/react-query";
import { usePackageDetailsCache } from "..";

export const AppK = () => {
  const [removeChild, setRemoveChild] = useState("");
  const alert = useAlertContext();
  const [loading, setLoading] = useState(false);
  const { data: user } = useGetUser();
  const cache = usePackageDetailsCache();
  const submission = useMutation({
    mutationFn: (config: SubmissionServiceParameters<any>) => submit(config),
  });

  const onChildRemove = async (id: string) => {
    setLoading(true);
    submission.mutate(
      {
        data: { id, appkParentId: cache.data.id },
        user,
        authority: cache.data.authority,
        endpoint: "/action/remove-appk-child",
      },
      {
        onSuccess: async () => {
          setTimeout(() => {
            setRemoveChild("");
            cache.refetch();
            setLoading(false);
            alert.setContent({
              header: "Package withdrawn",
              body: `The package ${id} has been withdrawn.`,
            });
            alert.setBannerStyle("success");
            alert.setBannerShow(true);
            alert.setBannerDisplayOn(window.location.pathname as Route);
          }, 5000);
        },
        onError: (err) => {
          console.error(err);
          setLoading(false);
        },
      },
    );
  };
  console.log(cache.data.appkChildren);
  if (!cache.data.appkChildren || cache.data.appkChildren.length === 0) {
    return <></>;
  }

  return (
    <div className="my-2" id="appendix_k">
      <T.Table>
        <T.TableHeader>
          <T.TableRow>
            <T.TableHead className="w-[300px]">Package ID</T.TableHead>
            <T.TableHead>Actions</T.TableHead>
          </T.TableRow>
        </T.TableHeader>
        <T.TableBody>
          {cache.data.appkChildren?.map((CHILD) => {
            return (
              <T.TableRow key={`${CHILD._id}`}>
                <T.TableCell className="font-medium">
                  <p>{CHILD._id}</p>
                </T.TableCell>
                <T.TableCell>
                  <Button
                    disabled={
                      cache.data.seatoolStatus === SEATOOL_STATUS.WITHDRAWN ||
                      user?.isCms
                    }
                    size="sm"
                    className="flex gap-1"
                    onClick={() => setRemoveChild(CHILD._id)}
                  >
                    <Undo2 size={20} />
                    Withdraw
                  </Button>
                </T.TableCell>
              </T.TableRow>
            );
          })}
        </T.TableBody>
      </T.Table>
      {(submission.isLoading || loading) && <LoadingSpinner />}
      <ConfirmationModal
        open={!!removeChild}
        onAccept={() => onChildRemove(removeChild)}
        onCancel={() => setRemoveChild("")}
        acceptButtonText="Yes, withdraw"
        cancelButtonText="Cancel"
        title="Are you sure you want to withdraw this 1915(c) Appendix K?"
        body={
          <>
            <p>
              Any 1915(c) Appendix Ks associated with {removeChild} will not be
              affected.
            </p>
          </>
        }
      />
    </div>
  );
};
