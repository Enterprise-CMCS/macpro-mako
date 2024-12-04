import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  insertNewSeatoolRecordsFromKafkaIntoMako,
  insertOneMacRecordsFromKafkaIntoMako,
} from "./sinkMainProcessors";
import * as sinkLib from "libs";
import { Document, seatool } from "shared-types/opensearch/main";

describe("insertOneMacRecordsFromKafkaIntoMako", () => {
  const spiedOnBulkUpdateDataWrapper = vi.fn();
  const TOPIC_PARTITION = "aws.onemac.migration.cdc-0";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(sinkLib, "bulkUpdateDataWrapper").mockImplementation(spiedOnBulkUpdateDataWrapper);
    vi.stubEnv("osDomain", "osDomain");
    vi.stubEnv("indexNamespace", "indexNamespace");
  });

  it("handles valid kafka records", () => {
    insertOneMacRecordsFromKafkaIntoMako(
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
      TOPIC_PARTITION,
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

  it("skips value-less kafka records", () => {
    insertOneMacRecordsFromKafkaIntoMako(
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
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid event name", () => {
    insertOneMacRecordsFromKafkaIntoMako(
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
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid properties", () => {
    insertOneMacRecordsFromKafkaIntoMako(
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
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid JSON", () => {
    const spiedOnLogError = vi.spyOn(sinkLib, "logError").mockImplementation(vi.fn());

    insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.onemac.migration.cdc",
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          // encoded properties without curly braces --> key1: property, key2: property2
          value:
            "eyJldmVudCI6ICJuZXctbWVkaWNhaWQtc3VibWlzc2lvbiIsICJhdHRhY2htZW50cyI6IHt9LCAiYXV0aG9yaXR5IjogIk1lZGljYWlkIFNQQSIsICJwcm9wb3NlZEVmZmVjdGl2ZURhdGUiOiAxNzMyNTk3MjAwMDAwLCAiaWQiOiAiTUQtMjQtMjMwMCIsICJvcmlnaW4iOiAibWFrbyIsICJzdWJtaXR0ZXJOYW1lIjogIkdlb3JnZSBIYXJyaXNvbiIsICJzdWJtaXR0ZXJFbWFpbCI6ICJnZW9yZ2VAZXhhbXBsZS5jb20iLCAidGltZXN0YW1wIjogMTczMjY0NTA0MTUyNQ==",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalled();
  });
});

describe("insertNewSeatoolRecordsFromKafkaIntoMako", () => {
  // @ts-expect-error – cannot bother typing out unnecessary Document properties
  const spiedOnGetItems = vi.fn<() => Promise<Document[]>>(() =>
    Promise.resolve([
      {
        id: "MD-24-2300",
        changedDate: "2024-02-04 23:12:36",
      },
      {
        id: "WA-22-2100",
        changedDate: "2024-06-12 13:24:43",
      },
      {
        id: "NY-23-2200",
        changedDate: "2024-10-12 09:04:52",
      },
      {
        id: "WV-24-3230",
        changedDate: "2024-03-21 09:51:23",
      },
      {
        id: "IL-25-3130",
        changedDate: "2025-03-21 17:51:23",
      },
    ]),
  );
  const spiedOnBulkUpdateDataWrapper = vi.fn();
  const spiedOnLogError = vi.fn();
  const TOPIC_PARTITION = "aws.seatool.ksql.onemac.three.agg.State_Plan";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(sinkLib, "getItems").mockImplementation(spiedOnGetItems);
    vi.spyOn(sinkLib, "bulkUpdateDataWrapper").mockImplementation(spiedOnBulkUpdateDataWrapper);
    vi.spyOn(sinkLib, "logError").mockImplementation(spiedOnLogError);

    vi.stubEnv("osDomain", "osDomain");
    vi.stubEnv("indexNamespace", "indexNamespace");
  });

  it("outputs kafka records into mako records", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value:
            "eyJpZCI6ICJNRC0yNC0yMzAwIiwgIkFDVElPTl9PRkZJQ0VSUyI6IFt7IkZJUlNUX05BTUUiOiAiSm9obiIsICJMQVNUX05BTUUiOiAiRG9lIiwgIkVNQUlMIjogImpvaG4uZG9lQG1lZGljYWlkLmdvdiIsICJPRkZJQ0VSX0lEIjogMTIzNDUsICJERVBBUlRNRU5UIjogIlN0YXRlIFBsYW4gUmV2aWV3IiwgIlBIT05FIjogIjIwMi01NTUtMTIzNCJ9LCB7IkZJUlNUX05BTUUiOiAiRW1pbHkiLCAiTEFTVF9OQU1FIjogIlJvZHJpZ3VleiIsICJFTUFJTCI6ICJlbWlseS5yb2RyaWd1ZXpAbWVkaWNhaWQuZ292IiwgIk9GRklDRVJfSUQiOiAxMjM0NiwgIkRFUEFSVE1FTlQiOiAiQ29tcGxpYW5jZSBEaXZpc2lvbiIsICJQSE9ORSI6ICIyMDItNTU1LTU2NzgifV0sICJMRUFEX0FOQUxZU1QiOiBbeyJGSVJTVF9OQU1FIjogIk1pY2hhZWwiLCAiTEFTVF9OQU1FIjogIkNoZW4iLCAiRU1BSUwiOiAibWljaGFlbC5jaGVuQGNtcy5oaHMuZ292IiwgIk9GRklDRVJfSUQiOiA2Nzg5MCwgIkRFUEFSVE1FTlQiOiAiTWVkaWNhaWQgSW5ub3ZhdGlvbiBDZW50ZXIiLCAiUEhPTkUiOiAiMjAyLTU1NS05MDEyIn1dLCAiU1RBVEVfUExBTiI6IHsiUExBTl9UWVBFIjogMTIzLCAiU1BXX1NUQVRVU19JRCI6IDQsICJBUFBST1ZFRF9FRkZFQ1RJVkVfREFURSI6IDE3MDcwODgzNTYwMDAsICJDSEFOR0VEX0RBVEUiOiAxNzA0MTYzMjAwMDAwLCAiU1VNTUFSWV9NRU1PIjogIlNhbXBsZSBzdW1tYXJ5IiwgIlRJVExFX05BTUUiOiAiU2FtcGxlIFRpdGxlIiwgIlNUQVRVU19EQVRFIjogMTcwNDI0MDAwMDAwMCwgIlNVQk1JU1NJT05fREFURSI6IDE3MDQzMjY0MDAwMDAsICJMRUFEX0FOQUxZU1RfSUQiOiA2Nzg5MCwgIkFDVFVBTF9FRkZFQ1RJVkVfREFURSI6IG51bGwsICJQUk9QT1NFRF9EQVRFIjogbnVsbCwgIlNUQVRFX0NPREUiOiAiMTAifSwgIlJBSSI6IFtdLCAiQUNUSU9OVFlQRVMiOiBbeyJBQ1RJT05fTkFNRSI6ICJJbml0aWFsIFJldmlldyIsICJBQ1RJT05fSUQiOiAxLCAiUExBTl9UWVBFX0lEIjogMTIzfV0sICJTVEFURV9QTEFOX1NFUlZJQ0VUWVBFUyI6IFt7IlNQQV9UWVBFX0lEIjogMSwgIlNQQV9UWVBFX05BTUUiOiAiVHlwZSBBIn1dLCAiU1RBVEVfUExBTl9TRVJWSUNFX1NVQlRZUEVTIjogW3siVFlQRV9JRCI6IDEsICJUWVBFX05BTUUiOiAiU3ViVHlwZSBYIn1dfQ==",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          actionType: "Initial Review",
          approvedEffectiveDate: "2024-02-04T23:12:36.000Z",
          authority: "1915(c)",
          changed_date: 1704163200000,
          cmsStatus: "Approved",
          description: "Sample summary",
          finalDispositionDate: "2024-01-03T00:00:00.000Z",
          id: "MD-24-2300",
          initialIntakeNeeded: false,
          leadAnalystEmail: "michael.chen@cms.hhs.gov",
          leadAnalystName: "Michael Chen",
          leadAnalystOfficerId: 67890,
          locked: false,
          proposedDate: null,
          raiReceivedDate: null,
          raiRequestedDate: null,
          raiWithdrawEnabled: false,
          raiWithdrawnDate: null,
          reviewTeam: [
            {
              email: "john.doe@medicaid.gov",
              name: "John Doe",
            },
            {
              email: "emily.rodriguez@medicaid.gov",
              name: "Emily Rodriguez",
            },
          ],
          seatoolStatus: "Approved",
          secondClock: false,
          state: "10",
          stateStatus: "Approved",
          statusDate: "2024-01-03T00:00:00.000Z",
          subTypes: [
            {
              TYPE_ID: 1,
              TYPE_NAME: "SubType X",
            },
          ],
          subject: "Sample Title",
          submissionDate: "2024-01-04T00:00:00.000Z",
          types: [
            {
              SPA_TYPE_ID: 1,
              SPA_TYPE_NAME: "Type A",
            },
          ],
        },
      ],
      "main",
    );
  });

  it("skips newer mako records", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "V1YtMjQtMzIzMA==",
          value:
            "eyJpZCI6IldWLTI0LTMyMzAiLCJBQ1RJT05fT0ZGSUNFUlMiOlt7IkZJUlNUX05BTUUiOiJMaXNhIiwiTEFTVF9OQU1FIjoiVGhvbXBzb24iLCJFTUFJTCI6Imxpc2EudGhvbXBzb25AbWVkaWNhaWQuZ292IiwiT0ZGSUNFUl9JRCI6Nzg5MDEsIkRFUEFSVE1FTlQiOiJSdXJhbCBIZWFsdGggU2VydmljZXMiLCJQSE9ORSI6IjIwMi01NTUtMzQ1NiJ9LHsiRklSU1RfTkFNRSI6IktldmluIiwiTEFTVF9OQU1FIjoiQW5kZXJzb24iLCJFTUFJTCI6ImtldmluLmFuZGVyc29uQG1lZGljYWlkLmdvdiIsIk9GRklDRVJfSUQiOjc4OTAyLCJERVBBUlRNRU5UIjoiRmluYW5jaWFsIFBsYW5uaW5nIiwiUEhPTkUiOiIyMDItNTU1LTc4OTAifV0sIkxFQURfQU5BTFlTVCI6W3siRklSU1RfTkFNRSI6IkVsaXphYmV0aCIsIkxBU1RfTkFNRSI6IktpbSIsIkVNQUlMIjoiZWxpemFiZXRoLmtpbUBjbXMuaGhzLmdvdiIsIk9GRklDRVJfSUQiOjIzNDU2LCJERVBBUlRNRU5UIjoiUG9saWN5IEludGVncmF0aW9uIiwiUEhPTkUiOiIyMDItNTU1LTIzNDUifV0sIlNUQVRFX1BMQU4iOnsiUExBTl9UWVBFIjoxMjEsIlNQV19TVEFUVVNfSUQiOjExLCJBUFBST1ZFRF9FRkZFQ1RJVkVfREFURSI6MTcxMTA2NTYwMDAwMCwiQ0hBTkdFRF9EQVRFIjoxNzExMDY1NjAwMDAwLCJTVU1NQVJZX01FTU8iOiIxMTE1IERlbW9uc3RyYXRpb24gV2FpdmVyIFJldmlldyIsIlRJVExFX05BTUUiOiJXViAxMTE1IE1lZGljYWlkIERlbW9uc3RyYXRpb24gUHJvamVjdCIsIlNUQVRVU19EQVRFIjoxNzEwOTc5MjAwMDAwLCJTVUJNSVNTSU9OX0RBVEUiOjE3MTEwNjU2MDAwMDAsIkxFQURfQU5BTFlTVF9JRCI6MjM0NTYsIkFDVFVBTF9FRkZFQ1RJVkVfREFURSI6bnVsbCwiUFJPUE9TRURfREFURSI6bnVsbCwiU1RBVEVfQ09ERSI6IjQwIn0sIlJBSSI6W10sIkFDVElPTlRZUEVTIjpbeyJBQ1RJT05fTkFNRSI6IlBlbmRpbmcgQXBwcm92YWwiLCJBQ1RJT05fSUQiOjQsIlBMQU5fVFlQRV9JRCI6MTIxfV0sIlNUQVRFX1BMQU5fU0VSVklDRVRZUEVTIjpbeyJTUEFfVFlQRV9JRCI6NCwiU1BBX1RZUEVfTkFNRSI6IlR5cGUgRCJ9XSwiU1RBVEVfUExBTl9TRVJWSUNFX1NVQlRZUEVTIjpbeyJUWVBFX0lEIjo0LCJUWVBFX05BTUUiOiJTdWJUeXBlIFcifV19'",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("tombstones records with no value property", async () => {
    const spiedOnTombstone = vi.spyOn(seatool, "tombstone");

    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TlktMjMtMjIwMA==",
          value: "", // <-- missing value
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnTombstone).toBeCalledWith("NY-23-2200");
    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          actionType: null,
          approvedEffectiveDate: null,
          authority: null,
          changedDate: null,
          cmsStatus: null,
          description: null,
          finalDispositionDate: null,
          id: "NY-23-2200",
          leadAnalystName: null,
          leadAnalystOfficerId: null,
          proposedDate: null,
          raiReceivedDate: null,
          raiRequestedDate: null,
          raiWithdrawnDate: null,
          reviewTeam: null,
          seatoolStatus: null,
          state: null,
          stateStatus: null,
          statusDate: null,
          subTypes: null,
          subject: null,
          submissionDate: null,
          types: null,
        },
      ],
      "main",
    );
  });

  it("skips over records with no key property", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "", // <-- missing key
          value:
            "eyJpZCI6IklMLTI1LTMxMzAiLCJBQ1RJT05fT0ZGSUNFUlMiOlt7IkZJUlNUX05BTUUiOiJBbWFuZGEiLCJMQVNUX05BTUUiOiJCcm93biIsIkVNQUlMIjoiYW1hbmRhLmJyb3duQG1lZGljYWlkLmdvdiIsIk9GRklDRVJfSUQiOjg5MDEyLCJERVBBUlRNRU5UIjoiU3RyYXRlZ2ljIEluaXRpYXRpdmVzIiwiUEhPTkUiOiIyMDItNTU1LTU2NzgifSx7IkZJUlNUX05BTUUiOiJDYXJsb3MiLCJMQVNUX05BTUUiOiJNZW5kZXoiLCJFTUFJTCI6ImNhcmxvcy5tZW5kZXpAbWVkaWNhaWQuZ292IiwiT0ZGSUNFUl9JRCI6ODkwMTMsIkRFUEFSVE1FTlQiOiJQcm9ncmFtIEV2YWx1YXRpb24iLCJQSE9ORSI6IjIwMi01NTUtODkwMSJ9XSwiTEVBRF9BTkFMWVNUIjpbeyJGSVJTVF9OQU1FIjoiRGFuaWVsIiwiTEFTVF9OQU1FIjoiUGFyayIsIkVNQUlMIjoiZGFuaWVsLnBhcmtAY21zLmhocy5nb3YiLCJPRkZJQ0VSX0lEIjozNDU2NywiREVQQVJUTUVOVCI6Iklubm92YXRpdmUgU29sdXRpb25zIiwiUEhPTkUiOiIyMDItNTU1LTM0NTYifV0sIlNUQVRFX1BMQU4iOnsiUExBTl9UWVBFIjoxMjQsIlNQV19TVEFUVVNfSUQiOjEwLCJBUFBST1ZFRF9FRkZFQ1RJVkVfREFURSI6MTc0MDYyNDAwMDAwMCwiQ0hBTkdFRF9EQVRFIjoxNzQwNjI0MDAwMDAwLCJTVU1NQVJZX01FTU8iOiJDSElQIFN0YXRlIFBsYW4gQW1lbmRtZW50IFJldmlldyIsIlRJVExFX05BTUUiOiJJTCBDSElQIFByb2dyYW0gRmluYW5jaWFsIFN0cmF0ZWd5IiwiU1RBVFVTX0RBVEUiOjE3NDA1Mzc2MDAwMDAsIlNVQk1JU1NJT05fREFURSI6MTc0MDYyNDAwMDAwMCwiTEVBRF9BTkFMWVNUX0lEIjozNDU2NywiQUNUVUFMX0VGRkVDVElWRV9EQVRFIjpudWxsLCJQUk9QT1NFRF9EQVRFIjpudWxsLCJTVEFURV9DT0RFIjoiNTAifSwiUkFJIjpbXSwiQUNUSU9OVFlQRVMiOlt7IkFDVElPTl9OQU1FIjoiRmluYW5jaWFsIFJldmlldyIsIkFDVElPTl9JRCI6NSwiUExBTl9UWVBFX0lEIjoxMjR9XSwiU1RBVEVfUExBTl9TRVJWSUNFVFlQRVMiOlt7IlNQQV9UWVBFX0lEIjo1LCJTUEFfVFlQRV9OQU1FIjoiVHlwZSBFIn1dLCJTVEFURV9QTEFOX1NFUlZJQ0VfU1VCVFlQRVMiOlt7IlRZUEVfSUQiOjUsIlRZUEVfTkFNRSI6IlN1YlR5cGUgViJ9XX0=",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips over records with invalid properties", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "V1YtMjQtMzIzMA==",
          // value is invalid JSON
          value:
            "ImlkIjogIldBLTIyLTIxMDAiLCAiQUNUSU9OX09GRklDRVJTIjogWyB7ICJGSVJTVF9OQU1FIjogIlNhcmFoIiwgIkxBU1RfTkFNRSI6ICJXaWxsaWFtcyIsICJFTUFJTCI6ICJzYXJhaC53aWxsaWFtc0BtZWRpY2FpZC5nb3YiLCAiT0ZGSUNFUl9JRCI6IDU0MzIxLCAiREVQQVJUTUVOVCI6ICJQb2xpY3kgRGV2ZWxvcG1lbnQiLCAiUEhPTkUiOiAiMjAyLTU1NS0yNDY4IiB9LCB7ICJGSVJTVF9OQU1FIjogIkRhdmlkIiwgIkxBU1RfTkFNRSI6ICJNYXJ0aW5leiIsICJFTUFJTCI6ICJkYXZpZC5tYXJ0aW5lekBtZWRpY2FpZC5nb3YiLCAiT0ZGSUNFUl9JRCI6IDU0MzIyLCAiREVQQVJUTUVOVCI6ICJSZWd1bGF0b3J5IENvbXBsaWFuY2UiLCAiUEhPTkUiOiAiMjAyLTU1NS0xMzU3IiB9IF0sICJMRUFEX0FOQUxZU1QiOiBbIHsgIkZJUlNUX05BTUUiOiAiSmVubmlmZXIiLCAiTEFTVF9OQU1FIjogIkxlZSIsICJFTUFJTCI6ICJqZW5uaWZlci5sZWVAY21zLmhocy5nb3YiLCAiT0ZGSUNFUl9JRCI6IDk4NzY1LCAiREVQQVJUTUVOVCI6ICJTdGF0ZSBJbm5vdmF0aW9ucyIsICJQSE9ORSI6ICIyMDItNTU1LTg3NjUiIH0gXSwgIlNUQVRFX1BMQVEiOiB7ICJQTEFO",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "badparse",
      metadata: expect.any(Object),
      error: expect.any(Object),
    });
  });

  it("skips over records with seatoolStatus:'Unknown' || authority: null property values", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value:
            "eyJpZCI6ICJNRC0yNC0yMzAwIiwgIkFDVElPTl9PRkZJQ0VSUyI6IFt7IkZJUlNUX05BTUUiOiAiSm9obiIsICJMQVNUX05BTUUiOiAiRG9lIiwgIkVNQUlMIjogImpvaG4uZG9lQG1lZGljYWlkLmdvdiIsICJPRkZJQ0VSX0lEIjogMTIzNDUsICJERVBBUlRNRU5UIjogIlN0YXRlIFBsYW4gUmV2aWV3IiwgIlBIT05FIjogIjIwMi01NTUtMTIzNCJ9LCB7IkZJUlNUX05BTUUiOiAiRW1pbHkiLCAiTEFTVF9OQU1FIjogIlJvZHJpZ3VleiIsICJFTUFJTCI6ICJlbWlseS5yb2RyaWd1ZXpAbWVkaWNhaWQuZ292IiwgIk9GRklDRVJfSUQiOiAxMjM0NiwgIkRFUEFSVE1FTlQiOiAiQ29tcGxpYW5jZSBEaXZpc2lvbiIsICJQSE9ORSI6ICIyMDItNTU1LTU2NzgifV0sICJMRUFEX0FOQUxZU1QiOiBbeyJGSVJTVF9OQU1FIjogIk1pY2hhZWwiLCAiTEFTVF9OQU1FIjogIkNoZW4iLCAiRU1BSUwiOiAibWljaGFlbC5jaGVuQGNtcy5oaHMuZ292IiwgIk9GRklDRVJfSUQiOiA2Nzg5MCwgIkRFUEFSVE1FTlQiOiAiTWVkaWNhaWQgSW5ub3ZhdGlvbiBDZW50ZXIiLCAiUEhPTkUiOiAiMjAyLTU1NS05MDEyIn1dLCAiU1RBVEVfUExBTiI6IHsiUExBTl9UWVBFIjogOTk5LCAiU1BXX1NUQVRVU19JRCI6IDk5OSwgIkFQUFJPVkVEX0VGRkVDVElWRV9EQVRFIjogMTcwNzA4ODM1NjAwMCwgIkNIQU5HRURfREFURSI6IDE3MDQxNjMyMDAwMDAsICJTVU1NQVJZX01FTU8iOiAiU2FtcGxlIHN1bW1hcnkiLCAiVElUTEVfTkFNRSI6ICJTYW1wbGUgVGl0bGUiLCAiU1RBVFVTX0RBVEUiOiAxNzA0MjQwMDAwMDAwLCAiU1VCTUlTU0lPTl9EQVRFIjogMTcwNDMyNjQwMDAwMCwgIkxFQURfQU5BTFlTVF9JRCI6IDY3ODkwLCAiQUNUVUFMX0VGRkVDVElWRV9EQVRFIjogbnVsbCwgIlBST1BPU0VEX0RBVEUiOiBudWxsLCAiU1RBVEVfQ09ERSI6ICIxMCJ9LCAiUkFJIjogW10sICJBQ1RJT05UWVBFUyI6IFt7IkFDVElPTl9OQU1FIjogIkluaXRpYWwgUmV2aWV3IiwgIkFDVElPTl9JRCI6IDEsICJQTEFOX1RZUEVfSUQiOiAxMjN9XSwgIlNUQVRFX1BMQU5fU0VSVklDRVRZUEVTIjogW3siU1BBX1RZUEVfSUQiOiAxLCAiU1BBX1RZUEVfTkFNRSI6ICJUeXBlIEEifV0sICJTVEFURV9QTEFOX1NFUlZJQ0VfU1VCVFlQRVMiOiBbeyJUWVBFX0lEIjogMSwgIlRZUEVfTkFNRSI6ICJTdWJUeXBlIFgifV19",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips over records that fail SEATOOL safeParse", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan",
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value:
            "eyJBQ1RJT05fT0ZGSUNFUlMiOiBbeyJGSVJTVF9OQU1FIjogIkpvaG4iLCAiTEFTVF9OQU1FIjogIkRvZSIsICJFTUFJTCI6ICJqb2huLmRvZUBtZWRpY2FpZC5nb3YiLCAiT0ZGSUNFUl9JRCI6IDEyMzQ1LCAiREVQQVJUTUVOVCI6ICJTdGF0ZSBQbGFuIFJldmlldyIsICJQSE9ORSI6ICIyMDItNTU1LTEyMzQifSwgeyJGSVJTVF9OQU1FIjogIkVtaWx5IiwgIkxBU1RfTkFNRSI6ICJSb2RyaWd1ZXoiLCAiRU1BSUwiOiAiZW1pbHkucm9kcmlndWV6QG1lZGljYWlkLmdvdiIsICJPRkZJQ0VSX0lEIjogMTIzNDYsICJERVBBUlRNRU5UIjogIkNvbXBsaWFuY2UgRGl2aXNpb24iLCAiUEhPTkUiOiAiMjAyLTU1NS01Njc4In1dLCAiTEVBRF9BTkFMWVNUIjogW3siRklSU1RfTkFNRSI6ICJNaWNoYWVsIiwgIkxBU1RfTkFNRSI6ICJDaGVuIiwgIkVNQUlMIjogIm1pY2hhZWwuY2hlbkBjbXMuaGhzLmdvdiIsICJPRkZJQ0VSX0lEIjogNjc4OTAsICJERVBBUlRNRU5UIjogIk1lZGljYWlkIElubm92YXRpb24gQ2VudGVyIiwgIlBIT05FIjogIjIwMi01NTUtOTAxMiJ9XSwgIlNUQVRFX1BMQU4iOiB7IlBMQU5fVFlQRSI6IDEyMywgIlNQV19TVEFUVVNfSUQiOiA0LCAiQVBQUk9WRURfRUZGRUNUSVZFX0RBVEUiOiAxNzA3MDg4MzU2MDAwLCAiQ0hBTkdFRF9EQVRFIjogMTcwNDE2MzIwMDAwMCwgIlNVTU1BUllfTUVNTyI6ICJTYW1wbGUgc3VtbWFyeSIsICJUSVRMRV9OQU1FIjogIlNhbXBsZSBUaXRsZSIsICJTVEFUVVNfREFURSI6IDE3MDQyNDAwMDAwMDAsICJTVUJNSVNTSU9OX0RBVEUiOiAxNzA0MzI2NDAwMDAwLCAiTEVBRF9BTkFMWVNUX0lEIjogNjc4OTAsICJBQ1RVQUxfRUZGRUNUSVZFX0RBVEUiOiBudWxsLCAiUFJPUE9TRURfREFURSI6IG51bGwsICJTVEFURV9DT0RFIjogIjEwIn0sICJSQUkiOiBbXSwgIkFDVElPTlRZUEVTIjogW3siQUNUSU9OX05BTUUiOiAiSW5pdGlhbCBSZXZpZXciLCAiQUNUSU9OX0lEIjogMX1dLCAiU1RBVEVfUExBTl9TRVJWSUNFVFlQRVMiOiBbeyJTUEFfVFlQRV9JRCI6IDEsICJTUEFfVFlQRV9OQU1FIjogIlR5cGUgQSJ9XSwgIlNUQVRFX1BMQU5fU0VSVklDRV9TVUJUWVBFUyI6IFt7IlRZUEVfSUQiOiAxLCAiVFlQRV9OQU1FIjogIlN1YlR5cGUgWCJ9XX0=",
          headers: {},
        },
      ],
      TOPIC_PARTITION,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "validation",
      metadata: expect.any(Object),
      error: expect.any(Array),
    });
  });
});
