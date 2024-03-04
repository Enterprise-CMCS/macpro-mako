import * as UI from "@/components";
import { FC, useState } from "react";
import { OsTableColumn } from "./types";
import { useOsContext } from "../Provider";
import { useOsUrl, LoadingSpinner } from "@/components";
import { VisibilityPopover } from "../Settings";
import { BLANK_VALUE } from "@/consts";
import { opensearch } from "shared-types";

export const OsTable: FC<{
  columns: OsTableColumn[];
}> = (props) => {
  const context = useOsContext();

  const url = useOsUrl();

  const [osColumns, setOsColumns] = useState(
    props.columns.map((COL) => ({
      ...COL,
      hidden: !(COL?.visible ?? true),
      locked: COL?.locked ?? false,
    }))
  );

  const onToggle = (field: string) => {
    setOsColumns((state) => {
      return state?.map((S) => {
        if (S.field !== field) return S;
        return { ...S, hidden: !S.hidden };
      });
    });
  };

  return (
    <UI.Table className="flex-1">
      <UI.TableHeader className="sticky top-0 bg-white z-50">
        <UI.TableRow>
          <UI.TableHead
            className="w-[10px]"
            icon={
              <VisibilityPopover
                list={osColumns.filter((COL) => !COL.locked || COL.field)}
                onItemClick={onToggle}
              />
            }
          />
          {osColumns.map((TH) => {
            if (TH.hidden) return null;
            return (
              <UI.TableHead
                {...(!!TH.props && TH.props)}
                key={`TH-${TH.field}`}
                isActive={url.state.sort.field === TH.field}
                desc={url.state.sort.order === "desc"}
                {...(TH.isSystem && { className: "pointer-events-none" })}
                onClick={() => {
                  if (!TH.field) return;
                  url.onSet((s) => ({
                    ...s,
                    sort: {
                      field: TH.field as opensearch.main.Field,
                      order: s.sort.order === "desc" ? "asc" : "desc",
                    },
                  }));
                }}
              >
                {TH.label}
              </UI.TableHead>
            );
          })}
        </UI.TableRow>
      </UI.TableHeader>

      <UI.TableBody>
        {/* TODO: Add a skeleton loader after discussing with HCD.
        See https://qmacbis.atlassian.net/browse/OY2-25623 */}
        {!context.data && (
          <UI.TableRow>
            <UI.TableCell>
              <LoadingSpinner />
            </UI.TableCell>
          </UI.TableRow>
        )}
        {context.data && !context.data.hits.length && (
          <UI.TableRow className="h-10">
            <UI.TableCell className="flex pb-14">
              <p className="font-medium whitespace-nowrap h-[20px]"> </p>
              <p className="absolute right-[50%] translate-x-[50%] translate-y-[50%] font-medium text-lg text-gray-500">
                No Results Found
              </p>
            </UI.TableCell>
          </UI.TableRow>
        )}
        {context.data?.hits.map((DAT) => (
          <UI.TableRow className="max-h-1" key={DAT._source.id}>
            <UI.TableCell className="fixed" />
            {osColumns.map((COL) => {
              if (COL.hidden) return null;
              return (
                <UI.TableCell
                  key={`${COL.field}-${DAT._source.id}`}
                  className="font-medium whitespace-nowrap"
                >
                  {COL.cell(DAT._source) ?? BLANK_VALUE}
                </UI.TableCell>
              );
            })}
          </UI.TableRow>
        ))}
      </UI.TableBody>
    </UI.Table>
  );
};
