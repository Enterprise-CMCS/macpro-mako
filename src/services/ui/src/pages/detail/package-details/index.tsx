import { ConfirmationModal, DetailsSection } from "@/components";
import { spaDetails, submissionDetails } from "./hooks";
import { opensearch } from "shared-types";
import { FC } from "react";
import { useOsSearch } from "@/api";
import { useEffect, useState } from "react";
import * as T from "@/components/Table";
import { Button } from "@/components/Inputs";
import {} from "@radix-ui/react-icons";
import { Plug } from "lucide-react";

import { DetailSectionItem } from "./hooks";
import { useGetUser } from "@/api/useGetUser";
import { ModalProvider } from "@/pages/form/modals";
import { API } from "aws-amplify";
import { buildSubmissionPayload } from "@/api/submissionService";

export const AppK = (props: opensearch.main.Document) => {
  const [removeChild, setRemoveChild] = useState("");
  const { data: user } = useGetUser();
  const search = useOsSearch<opensearch.main.Field, opensearch.main.Response>();
  const [data, setData] = useState<opensearch.main.Response["hits"]["hits"]>(
    []
  );
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const onChildRemove = async (id: string) => {
    const body = buildSubmissionPayload({ appkChildId: id }, user, "/appk");
    try {
      await API.post("os", "/appk/remove-child", {
        body,
      }).then(() => setRemoveChild(""));
      setRemoveChild("");
    } catch (err) {
      console.error(err);
    }
  };

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
              <T.TableRow key={`${props.id}`}>
                <T.TableCell className="font-medium">{CHILD._id}</T.TableCell>
                <T.TableCell>
                  <Button size="sm" onClick={() => setRemoveChild(props.id)}>
                    <Plug /> Remove
                  </Button>
                </T.TableCell>
              </T.TableRow>
            );
          })}
        </T.TableBody>
      </T.Table>
      <ConfirmationModal
        open={!!removeChild}
        onAccept={() => onChildRemove(removeChild)}
        onCancel={() => setRemoveChild("")}
        title="Remove Appendix-K Waiver"
        body={
          <p>
            Are you sure you would like to remove the Waiver from the APP-K
            <em>{props.id}</em>?
          </p>
        }
      />
    </>
  );
};

export const DetailItemsGrid: FC<{ displayItems: DetailSectionItem[] }> = (
  props
) => {
  const { data: user } = useGetUser();
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {props.displayItems.map(({ label, value, canView }) => {
          return !canView(user) ? null : (
            <div key={label}>
              <h3 className="text-sm">{label}</h3>
              {value}
            </div>
          );
        })}
      </div>
      <hr className="my-4" />
    </>
  );
};

export const PackageDetails: FC<opensearch.main.Document> = (props) => {
  return (
    <DetailsSection
      id="package-details"
      title={`${props.planType} Package Details`}
    >
      <DetailItemsGrid displayItems={spaDetails(props)} />
      <DetailItemsGrid displayItems={submissionDetails(props)} />

      <AppK {...props} />
    </DetailsSection>
  );
};
