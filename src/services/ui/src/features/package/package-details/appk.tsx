import { ConfirmationModal, LoadingSpinner } from "@/components";
import { Authority, opensearch } from "shared-types";
import { useOsSearch } from "@/api";
import { useEffect, useState } from "react";
import * as T from "@/components/Table";
import { Button } from "@/components/Inputs";
import { Undo2 } from "lucide-react";

import { useGetUser } from "@/api/useGetUser";
import { SubmissionServiceParameters, submit } from "@/api/submissionService";
import { useMutation } from "@tanstack/react-query";

export const AppK = (props: opensearch.main.Document) => {
  const [removeChild, setRemoveChild] = useState("");
  const { data: user } = useGetUser();
  const [autoDelay, setAutoDelay] = useState(false); // delay for opensearch record to be ready

  const submission = useMutation({
    mutationFn: (config: SubmissionServiceParameters<any>) => submit(config),
  });
  const search = useOsSearch<opensearch.main.Field, opensearch.main.Response>();
  const [data, setData] = useState<opensearch.main.Response["hits"]["hits"]>(
    []
  );

  const initializeChildren = async () => {
    await search.mutateAsync(
      {
        index: "main",
        pagination: { size: 100, number: 0 },
        filters: [
          {
            field: "appkParentId.keyword",
            type: "term",
            value: props.id,
            prefix: "must",
          },
        ],
      },
      {
        onSuccess: (res) => setData(res.hits.hits),
      }
    );
  };

  useEffect(() => {
    initializeChildren();
  }, [props.id]);

  const onChildRemove = async (id: string) => {
    await submission.mutate(
      {
        data: { id, appkParentId: props.id },
        user,
        authority: props.authority as Authority,
        endpoint: "/action/remove-appk-child",
      },
      {
        onSuccess: async () => {
          setRemoveChild("");
          setAutoDelay(true);
          setTimeout(() => {
            initializeChildren();
            setAutoDelay(false);
          }, 5000);
        },
        onError: (err) => {
          console.error(err);
        },
      }
    );
  };

  if (!data.length) return <></>;

  return (
    <>
      <T.Table>
        <T.TableHeader>
          <T.TableRow>
            <T.TableHead className="w-[300px]">Package ID</T.TableHead>
            <T.TableHead>Actions</T.TableHead>
          </T.TableRow>
        </T.TableHeader>
        <T.TableBody>
          {data?.map((CHILD) => {
            return (
              <T.TableRow key={`${CHILD._id}`}>
                <T.TableCell className="font-medium">{CHILD._id}</T.TableCell>
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
      {(submission.isLoading || autoDelay) && <LoadingSpinner />}
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
    </>
  );
};
