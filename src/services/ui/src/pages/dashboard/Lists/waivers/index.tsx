import { useSearch } from "@/api";
import { useGetUser } from "@/api/useGetUser";
import { ErrorAlert, LoadingSpinner, SearchForm } from "@/components";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatus } from "../statusHelper";
import { SearchData, OsFilterable } from "shared-types";
import { Icon, Typography } from "@enterprise-cmcs/macpro-ux-lib";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/Sheet";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableHeader,
} from "@/components/Table";
import { Pagination } from "@/components/Pagination";
import { ExportButton } from "@/components/ExportButton";

export const WaiversList = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const { mutateAsync, isLoading, error } = useSearch();
  const { data: user } = useGetUser();
  const [pagination, setPagination] = useState<{
    size: number;
    number: number;
  }>({ size: 100, number: 0 });

  useEffect(() => {
    handleSearch("");
  }, [pagination]);

  const baseFilter = {
    field: "authority.keyword",
    type: "terms",
    value: ["WAIVER"],
    prefix: "must",
  } as OsFilterable;

  const handleSearch = async (search: string) => {
    const filters: OsFilterable[] = [baseFilter];
    if (search) {
      filters.push({
        type: "global_search",
        field: "status",
        value: search,
        prefix: "must",
      });
    }
    try {
      // TODO: move to url hash
      const data = await mutateAsync({
        pagination,
        filters,
        ...(!search && { sort: { field: "changedDate", order: "desc" } }),
      });

      setSearchData(data);
    } catch (error) {
      console.error("Error occurred during search:", error);
    }
  };

  // if (isLoading) return <LoadingSpinner />;

  if (error) return <ErrorAlert error={error} />;

  return (
    <section className="flex flex-col h-[calc(100vh-250px)]">
      <div className="flex flex-row gap-2 border-[1px] border-slate-200">
        <SearchForm
          handleSearch={handleSearch}
          setSearchText={setSearchText}
          searchText={searchText}
          disabled={isLoading}
        />
        <ExportButton type="waiver" filter={baseFilter} />
        <Sheet>
          <SheetTrigger>
            <div className="flex flex-row item-center border-slate-100 px-4">
              <Icon name="filter_list" />
              <Typography size="sm">Filters</Typography>
            </div>
          </SheetTrigger>
          <SheetContent className="bg-white">
            <SheetHeader>
              <Typography size="lg">Filters</Typography>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      {isLoading && <LoadingSpinner />}
      <Table className="flex-1 border-[1px]">
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead className="w-[150px]">Waiver ID</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Authority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchData?.hits.map((DAT) => (
            <TableRow key={DAT._source.id}>
              <TableCell className="font-medium">
                {(() => {
                  if (!DAT._source.authority) return null;
                  return (
                    <Link
                      className="cursor-pointer text-blue-600"
                      to={`/detail/${DAT?._source?.authority?.toLowerCase()}?id=${encodeURIComponent(
                        DAT?._id
                      )}`}
                    >
                      {DAT?._id}
                    </Link>
                  );
                })()}
              </TableCell>
              <TableCell>{DAT._source.state}</TableCell>
              <TableCell>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                  {DAT._source.authority}
                </span>
              </TableCell>

              <TableCell>
                {removeUnderscoresAndCapitalize(DAT?._source.actionType)}
              </TableCell>
              <TableCell>
                {getStatus(DAT._source.status, user?.isCms)}
              </TableCell>
              <TableCell>
                {(() => {
                  if (!DAT?._source.submissionDate) return null;
                  return format(
                    new Date(DAT?._source.submissionDate),
                    "MM/dd/yyyy"
                  );
                })()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        pageNumber={pagination.number}
        onPageChange={(number) => setPagination((s) => ({ ...s, number }))}
        count={searchData?.total?.value || 0}
        onSizeChange={(size) => setPagination(() => ({ number: 0, size }))}
        pageSize={pagination.size}
      />
    </section>
  );
};
