import * as UI from "@chakra-ui/react";
import { useState } from "react";
import { Resource } from "../lib/getAwsResources";
import { getStackOptions, getTypeOptions } from "../lib/getFilterOptions";
import { CheckboxFilterPopover } from "./CheckboxFilterPopover";
import { ResourceTable } from "./ResourceTable";
import CsvDownloadButton from "react-json-to-csv";

export const Resources = ({
  data,
  downloadFileName,
}: {
  data: Resource[];
  downloadFileName: string;
}) => {
  const [typeFilter, setTypeFilter] = useState<{
    options: string[];
  }>({ options: [] });
  const [stackFilter, setStackFilter] = useState<{
    options: string[];
  }>({ options: [] });
  let filteredData = [...data];

  if (stackFilter.options.length > 0) {
    filteredData = data.filter((item) =>
      stackFilter.options.includes(item.StackName)
    );
  }
  if (typeFilter.options.length > 0) {
    filteredData = filteredData.filter((obj) => {
      for (const type of typeFilter.options) {
        if (obj.ResourceType.includes(type)) {
          return true;
        }
      }
      return false;
    });
  }

  return (
    <UI.Container maxW="8xl">
      <UI.Box
        bg="bg-surface"
        boxShadow={{ base: "none", md: "sm" }}
        borderRadius={{ base: "none", md: "lg" }}
      >
        <UI.Stack spacing="5">
          <UI.Box px={{ base: "4", md: "6" }} pt="5">
            <UI.Stack
              direction={{ base: "column", md: "row" }}
              justify="space-between"
            >
              <UI.Text fontSize="lg" fontWeight="medium">
                Resources
              </UI.Text>
              <UI.Stack direction="row" justify="space-between">
                <CheckboxFilterPopover
                  label="Type"
                  filtersApplied={typeFilter.options.length}
                  options={getTypeOptions(
                    stackFilter.options.length > 0 ? filteredData : data
                  )}
                  onSubmit={(options) => setTypeFilter({ options })}
                />
                <CheckboxFilterPopover
                  label="Stack"
                  filtersApplied={stackFilter.options.length}
                  options={getStackOptions(
                    typeFilter.options.length > 0 ? filteredData : data
                  )}
                  onSubmit={(options) => setStackFilter({ options })}
                />
                <CsvDownloadButton
                  data={data}
                  filename={downloadFileName}
                  style={{
                    borderRadius: ".5rem",
                    border: "1px solid #e2e8f0",
                    display: "inline-block",
                    cursor: "pointer",
                    color: "inherit",
                    fontSize: ".875rem",
                    padding: "6px 16px",
                    fontWeight: 500,
                  }}
                >
                  Download Data
                </CsvDownloadButton>
              </UI.Stack>
            </UI.Stack>
          </UI.Box>
          <UI.Box overflowX="auto">
            <ResourceTable data={filteredData} />
          </UI.Box>
        </UI.Stack>
      </UI.Box>
    </UI.Container>
  );
};
