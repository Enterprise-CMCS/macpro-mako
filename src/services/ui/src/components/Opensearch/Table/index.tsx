import * as UI from "@/components/Table";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { FC, useState } from "react";
import { OsTableColumn } from "./types";
import { useOsContext } from "../Provider";
import { useOsParams } from "../useOpensearch";
import { VisibilityPopover } from "../Settings";
import { BLANK_VALUE } from "constant-values";

export const OsTable: FC<{
  columns: OsTableColumn[];
}> = (props) => {
  const context = useOsContext();

  const params = useOsParams();

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
    <UI.Table className="flex-1 border-[1px]">
      <UI.TableHeader className="sticky top-0 bg-white">
        <UI.TableRow>
          <UI.TableHead
            className="w-[10px]"
            icon={
              <VisibilityPopover
                list={osColumns.filter((COL) => !COL.locked)}
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
                isActive={params.state.sort.field === TH.field}
                desc={params.state.sort.order === "desc"}
                onClick={() =>
                  params.onSet((s) => ({
                    ...s,
                    sort: {
                      field: TH.field,
                      order: s.sort.order === "desc" ? "asc" : "desc",
                    },
                  }))
                }
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
          <div className="p-4">
            <LoadingSpinner />
          </div>
        )}

        {context.data?.hits.map((DAT) => (
          <UI.TableRow key={DAT._source.id}>
            <UI.TableCell className="fixed" />
            {osColumns.map((COL, IDX) => {
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
