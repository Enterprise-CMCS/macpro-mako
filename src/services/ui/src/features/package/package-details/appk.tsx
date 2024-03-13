import { ConfirmationModal, Link, LoadingSpinner } from "@/components";
import { Authority } from "shared-types";
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
  const { data: user } = useGetUser();
  const cache = usePackageDetailsCache();
  const submission = useMutation({
    mutationFn: (config: SubmissionServiceParameters<any>) => submit(config),
  });

  const onChildRemove = async (id: string) => {
    await submission.mutate(
      {
        data: { id, appkParentId: cache.data.id },
        user,
        authority: cache.data.authority as Authority,
        endpoint: "/action/remove-appk-child",
      },
      {
        onSuccess: async () => {
          setTimeout(() => {
            setRemoveChild("");
            cache.refetch();
          }, 5000);
        },
        onError: (err) => {
          console.error(err);
        },
      }
    );
  };

  if (!cache.data.appkChildren) return <></>;

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
                  <Link
                    path="/details"
                    query={{ id: CHILD._id }}
                    className="hover:underline font-semibold text-blue-600"
                  >
                    {CHILD._id}
                  </Link>
                </T.TableCell>
                <T.TableCell>
                  <Button
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
      {submission.isLoading && <LoadingSpinner />}
      <ConfirmationModal
        open={!!removeChild}
        onAccept={() => onChildRemove(removeChild)}
        onCancel={() => setRemoveChild("")}
        title="Remove from Appendix-K"
        body={
          <>
            <p>Are you sure you would like to remove: </p>
            <p className="text-lg font-semibold">
              <em>{removeChild}</em>
            </p>
          </>
        }
      />
    </div>
  );
};
