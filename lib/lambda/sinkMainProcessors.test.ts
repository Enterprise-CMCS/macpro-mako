import { beforeEach, describe, expect, it, vi } from "vitest";
import { processAndIndex } from "./sinkMainProcessors";
import * as sinkLib from "libs";

describe("processIndex", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv("osDomain", "osDomain");
    vi.stubEnv("indexNamespace", "indexNamespace");
  });

  it("handles valid kafka records successfully", () => {
    const spiedOnBulkUpdateDataWrapper = vi
      .spyOn(sinkLib, "bulkUpdateDataWrapper")
      .mockImplementation(vi.fn());

    processAndIndex(
      [
        {
          topic: "--mako--branch-name--aws.onemac.migration.cdc",
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value:
            "eyJldmVudCI6Im5ldy1tZWRpY2FpZC1zdWJtaXNzaW9uIiwiYXR0YWNobWVudHMiOnsiY21zRm9ybTE3OSI6eyJmaWxlcyI6W3siZmlsZW5hbWUiOiJTY3JlZW5zaG90IDIwMjQtMDctMDggYXQgMTEuNDIuMzXigK9BTS5wbmciLCJ0aXRsZSI6IlNjcmVlbnNob3QgMjAyNC0wNy0wOCBhdCAxMS40Mi4zNeKAr0FNIiwiYnVja2V0IjoibWFrby1yZWZhY3Rvci10ZXN0cy1zaW5rLWF0dGFjaG1lbnRzLTYzNTA1Mjk5NzU0NSIsImtleSI6IjEzNTEzZWVhLWJhNjItNGNiYS1hZjMxLTJlYzNjMTYwYjVlMS5wbmciLCJ1cGxvYWREYXRlIjoxNzMyNjQ1MDMzNTI5fV0sImxhYmVsIjoiQ01TIEZvcm0gMTc5In0sInNwYVBhZ2VzIjp7ImZpbGVzIjpbeyJmaWxlbmFtZSI6IlNjcmVlbnNob3QgMjAyNC0wNy0wOCBhdCAxMS40Mi4zNeKAr0FNLnBuZyIsInRpdGxlIjoiU2NyZWVuc2hvdCAyMDI0LTA3LTA4IGF0IDExLjQyLjM14oCvQU0iLCJidWNrZXQiOiJtYWtvLXJlZmFjdG9yLXRlc3RzLXNpbmstYXR0YWNobWVudHMtNjM1MDUyOTk3NTQ1Iiwia2V5IjoiYmJkZmE5NWYtZjY3Yy00OTgzLTg1MTctMjc0NWNjMDhkM2I2LnBuZyIsInVwbG9hZERhdGUiOjE3MzI2NDUwMzg4MDV9XSwibGFiZWwiOiJTUEEgUGFnZXMifSwiY292ZXJMZXR0ZXIiOnsibGFiZWwiOiJDb3ZlciBMZXR0ZXIifSwidHJpYmFsRW5nYWdlbWVudCI6eyJsYWJlbCI6IkRvY3VtZW50IERlbW9uc3RyYXRpbmcgR29vZC1GYWl0aCBUcmliYWwgRW5nYWdlbWVudCJ9LCJleGlzdGluZ1N0YXRlUGxhblBhZ2VzIjp7ImxhYmVsIjoiRXhpc3RpbmcgU3RhdGUgUGxhbiBQYWdlKHMpIn0sInB1YmxpY05vdGljZSI6eyJsYWJlbCI6IlB1YmxpYyBOb3RpY2UifSwic2ZxIjp7ImxhYmVsIjoiU3RhbmRhcmQgRnVuZGluZyBRdWVzdGlvbnMgKFNGUXMpIn0sInRyaWJhbENvbnN1bHRhdGlvbiI6eyJsYWJlbCI6IlRyaWJhbCBDb25zdWx0YXRpb24ifSwib3RoZXIiOnsibGFiZWwiOiJPdGhlciJ9fSwiYXV0aG9yaXR5IjoiTWVkaWNhaWQgU1BBIiwicHJvcG9zZWRFZmZlY3RpdmVEYXRlIjoxNzMyNTk3MjAwMDAwLCJpZCI6Ik1ELTI0LTIzMDAiLCJvcmlnaW4iOiJtYWtvIiwic3VibWl0dGVyTmFtZSI6Ikdlb3JnZSBIYXJyaXNvbiIsInN1Ym1pdHRlckVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIiwidGltZXN0YW1wIjoxNzMyNjQ1MDQxNTI2fQ==",
          headers: {},
        },
      ],
      "aws.onemac.migration.cdc-0",
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          additionalInformation: undefined,
          authority: "Medicaid SPA",
          changedDate: "2024-11-26T18:17:21.526Z",
          cmsStatus: "Pending",
          description: null,
          id: "MD-24-2300",
          makoChangedDate: "2024-11-26T18:17:21.526Z",
          origin: "OneMAC",
          raiWithdrawEnabled: false,
          seatoolStatus: "Pending",
          state: "MD",
          stateStatus: "Under Review",
          statusDate: "2024-11-26T13:17:21.526Z",
          proposedDate: 1732597200000,
          subject: null,
          submissionDate: "2024-11-26T00:00:00.000Z",
          submitterEmail: "george@example.com",
          submitterName: "George Harrison",
          initialIntakeNeeded: true,
        },
      ],
      "main",
    );
  });

  it("handles value-less kafka records successfully", () => {
    const spiedOnBulkUpdateDataWrapper = vi
      .spyOn(sinkLib, "bulkUpdateDataWrapper")
      .mockImplementation(vi.fn());

    processAndIndex(
      [
        {
          topic: "--mako--branch-name--aws.onemac.migration.cdc",
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: "", // <-- missing value
          headers: {},
        },
      ],
      "aws.onemac.migration.cdc-0",
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("handles kafka records with invalid event name successfully", () => {
    const spiedOnBulkUpdateDataWrapper = vi
      .spyOn(sinkLib, "bulkUpdateDataWrapper")
      .mockImplementation(vi.fn());

    processAndIndex(
      [
        {
          topic: "--mako--branch-name--aws.onemac.migration.cdc",
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          // encoded string with `invalid-event-name` as 'record.event`
          value:
            "eyJldmVudCI6ICJpbnZhbGlkLWV2ZW50LW5hbWUiLCAiYXR0YWNobWVudHMiOiB7ImNtc0Zvcm0xNzkiOiB7ImZpbGVzIjogW3siZmlsZW5hbWUiOiAiU2NyZWVuc2hvdCAyMDI0LTA3LTA4IGF0IDExLjQyLjM1XHUyMDJmQU0ucG5nIiwgInRpdGxlIjogIlNjcmVlbnNob3QgMjAyNC0wNy0wOCBhdCAxMS40Mi4zNVx1MjAyZkFNIiwgImJ1Y2tldCI6ICJtYWtvLXJlZmFjdG9yLXRlc3RzLXNpbmstYXR0YWNobWVudHMtNjM1MDUyOTk3NTQ1IiwgImtleSI6ICIxMzUxM2VlYS1iYTYyLTRjYmEtYWYzMS0yZWMzYzE2MGI1ZTEucG5nIiwgInVwbG9hZERhdGUiOiAxNzMyNjQ1MDMzNTI5fV0sICJsYWJlbCI6ICJDTVMgRm9ybSAxNzkifSwgInNwYVBhZ2VzIjogeyJmaWxlcyI6IFt7ImZpbGVuYW1lIjogIlNjcmVlbnNob3QgMjAyNC0wNy0wOCBhdCAxMS40Mi4zNVx1MjAyZkFNLnBuZyIsICJ0aXRsZSI6ICJTY3JlZW5zaG90IDIwMjQtMDctMDggYXQgMTEuNDIuMzVcdTIwMmZBTSIsICJidWNrZXQiOiAibWFrby1yZWZhY3Rvci10ZXN0cy1zaW5rLWF0dGFjaG1lbnRzLTYzNTA1Mjk5NzU0NSIsICJrZXkiOiAiYmJkZmE5NWYtZjY3Yy00OTgzLTg1MTctMjc0NWNjMDhkM2I2LnBuZyIsICJ1cGxvYWREYXRlIjogMTczMjY0NTAzODgwNX1dLCAibGFiZWwiOiAiU1BBIFBhZ2VzIn0sICJjb3ZlckxldHRlciI6IHsibGFiZWwiOiAiQ292ZXIgTGV0dGVyIn0sICJ0cmliYWxFbmdhZ2VtZW50IjogeyJsYWJlbCI6ICJEb2N1bWVudCBEZW1vbnN0cmF0aW5nIEdvb2QtRmFpdGggVHJpYmFsIEVuZ2FnZW1lbnQifSwgImV4aXN0aW5nU3RhdGVQbGFuUGFnZXMiOiB7ImxhYmVsIjogIkV4aXN0aW5nIFN0YXRlIFBsYW4gUGFnZShzKSJ9LCAicHVibGljTm90aWNlIjogeyJsYWJlbCI6ICJQdWJsaWMgTm90aWNlIn0sICJzZnEiOiB7ImxhYmVsIjogIlN0YW5kYXJkIEZ1bmRpbmcgUXVlc3Rpb25zIChTRlFzKSJ9LCAidHJpYmFsQ29uc3VsdGF0aW9u",
          headers: {},
        },
      ],
      "aws.onemac.migration.cdc-0",
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("handles kafka records with invalid properties successfully", () => {
    const spiedOnBulkUpdateDataWrapper = vi
      .spyOn(sinkLib, "bulkUpdateDataWrapper")
      .mockImplementation(vi.fn());

    processAndIndex(
      [
        {
          topic: "--mako--branch-name--aws.onemac.migration.cdc",
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          // encoded string with `attachments` as an empty {}
          value:
            "eyJldmVudCI6ICJuZXctbWVkaWNhaWQtc3VibWlzc2lvbiIsICJhdHRhY2htZW50cyI6IHt9LCAiYXV0aG9yaXR5IjogIk1lZGljYWlkIFNQQSIsICJwcm9wb3NlZEVmZmVjdGl2ZURhdGUiOiAxNzMyNTk3MjAwMDAwLCAiaWQiOiAiTUQtMjQtMjMwMCIsICJvcmlnaW4iOiAibWFrbyIsICJzdWJtaXR0ZXJOYW1lIjogIkdlb3JnZSBIYXJyaXNvbiIsICJzdWJtaXR0ZXJFbWFpbCI6ICJnZW9yZ2VAZXhhbXBsZS5jb20iLCAidGltZXN0YW1wIjogMTczMjY0NTA0MTUyNn0=",
          headers: {},
        },
      ],
      "aws.onemac.migration.cdc-0",
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });
});
