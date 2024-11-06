import {
  describe,
  it,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  expect,
} from "vitest";
import { documentPoller } from "./documentPoller";
import { SEATOOL_STATUS } from "shared-types/statusHelper";

describe("DocumentPoller", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  beforeAll(() => {
    vi.mock("@/api/useGetItem", () => ({
      getItem: vi.fn().mockReturnValue({
        _source: {
          seatoolStatus: "Pending",
        },
      }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should handle data from fetcher", async () => {
    const documentPollerData = await documentPoller("123", (data) => {
      return data.hasStatus(SEATOOL_STATUS.PENDING);
    }).startPollingData();

    expect(documentPollerData.correctDataStateFound).toBeTruthy();
  });
});
