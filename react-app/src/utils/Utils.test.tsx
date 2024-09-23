import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { DataPoller } from "./Poller/DataPoller";

describe("DataPoller", () => {
  // let fetcher: vi.Mock;
  // let onPoll: vi.Mock;
  // let poller: DataPoller<string>;
  const fetcher = vi.fn();
  const onPoll = vi.fn();
  const poller = new DataPoller({
    fetcher,
    onPoll,
    interval: 50,
    pollAttempts: 5,
  });

  // beforeEach(() => {
  //   // fetcher = vi.fn();
  //   // onPoll = vi.fn();
  //   poller = new DataPoller({
  //     fetcher,
  //     onPoll,
  //     interval: 50,
  //     pollAttempts: 5,
  //   });
  // });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should resolve with correctDataStateFound true when correct data state is found", async () => {
    fetcher.mockResolvedValueOnce("invalid value");
    onPoll.mockReturnValueOnce(false);
    fetcher.mockResolvedValueOnce("valid value");
    onPoll.mockReturnValueOnce(true);

    const result = await poller.startPollingData();

    expect(result).toEqual({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  test("should resolve with maxAttemptsReached true when max attempts reached", async () => {
    fetcher.mockResolvedValue("invalid value");
    onPoll.mockReturnValue(false);

    const result = await poller.startPollingData();

    expect(result).toEqual({
      correctDataStateFound: false,
      maxAttemptsReached: true,
    });
    expect(fetcher).toHaveBeenCalledTimes(5);
    expect(onPoll).toHaveBeenCalledTimes(5);
  });

  test("should stop polling when correct data state is found before reaching max attempts", async () => {
    fetcher.mockResolvedValueOnce("invalid value");
    onPoll.mockReturnValueOnce(false);
    fetcher.mockResolvedValueOnce("valid value");
    onPoll.mockReturnValueOnce(true);

    const result = await poller.startPollingData();

    expect(result).toEqual({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(onPoll).toHaveBeenCalledTimes(2);
  });
});
