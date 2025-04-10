import { TestExport } from "../index.d";

export const TEST_CF_EXPORT_ID = "test-export";
export const TEST_CF_EXPORT_NOT_FOUND_ID = "missing-test-export";

const exportsList: TestExport[] = [
  {
    ExportingStackId: "test-stack-id",
    Name: "test-export",
    Value: "test-value",
  },
];

export default exportsList;
