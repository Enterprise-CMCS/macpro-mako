import { useOsSearch } from "@/api";
import { DetailsSection } from "@/components";

import { useEffect, useState } from "react";
import { opensearch } from "shared-types";
import * as T from "@/components/Table";
import { Button } from "@/components/Inputs";

export const use = (props: opensearch.main.Document) => {
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

  return { children: data };
};

export const Component = (props: opensearch.main.Document) => {
  const hook = use(props);

  return (
    <DetailsSection id="package-details" title="Associated Waivers">
      <T.Table>
        <T.TableHeader>
          <T.TableRow>
            <T.TableHead className="w-[300px]">Package ID</T.TableHead>
            <T.TableHead>Actions</T.TableHead>
          </T.TableRow>
        </T.TableHeader>
        <T.TableBody>
          {hook.children?.map((CHILD) => {
            return (
              <T.TableRow key={`${props.id}`}>
                <T.TableCell>{CHILD._id}</T.TableCell>
                <T.TableCell>
                  <Button size="sm">Withdraw</Button>
                </T.TableCell>
              </T.TableRow>
            );
          })}
        </T.TableBody>
      </T.Table>
    </DetailsSection>
  );
};
