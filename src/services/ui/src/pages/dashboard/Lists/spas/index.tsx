import { useSearch } from "@/api";
import { useGetUser } from "@/api/useGetUser";
import { ErrorAlert, LoadingSpinner, SearchForm } from "@/components";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatus } from "../statusHelper";
import { SearchData } from "shared-types";
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

export const SpasList = () => {
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

  const handleSearch = async (search: string) => {
    try {
      // TODO: move to url hash
      const data = await mutateAsync({
        pagination,
        sort: { field: "changedDate", order: "desc" },
        filters: [
          {
            field: "authority.keyword",
            type: "terms",
            value: ["CHIP", "MEDICAID"],
            prefix: "must",
          },
          {
            type: "global_search",
            field: "additionalInformation",
            value: search,
            prefix: "must",
          },
        ],
      });

      setSearchData(data);
    } catch (error) {
      console.error("Error occurred during search:", error);
    }
  };

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
        <Sheet>
          <SheetTrigger>
            <div className="flex flex-row item-center border-slate-100 px-4">
              <Icon name="filter_list" />
              <Typography size="md">Filters</Typography>
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
            <TableHead className="w-[150px]">Spa ID</TableHead>
            <TableHead>State</TableHead>
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
                      to={`/detail/${DAT?._source?.authority?.toLowerCase()}-spa?id=${encodeURIComponent(
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
                {removeUnderscoresAndCapitalize(DAT?._source.planType)}
              </TableCell>
              <TableCell>
                {getStatus(DAT._source.status, user?.isCms)}
              </TableCell>
              <TableCell>
                {(() => {
                  if (!DAT?._source.submissionDate) return null;
                  return format(DAT?._source.submissionDate, "MM/dd/yyyy");
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
        onSizeChange={(size) => setPagination((s) => ({ ...s, size }))}
        pageSize={pagination.size}
      />
    </section>
  );
};
