import { describe, test, expect, vi, afterEach } from "vitest";
import { DataPoller } from "./Poller/DataPoller";

describe("DataPoller", () => {
  const fetcher = vi.fn();
  const onPoll = vi.fn();

  const createPoller = (interval: number, pollAttempts: number) => {
    return new DataPoller({
      fetcher,
      onPoll,
      interval,
      pollAttempts,
    });
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should resolve with correctDataStateFound true when correct data state is found", async () => {
    fetcher.mockResolvedValueOnce("invalid value");
    onPoll.mockReturnValueOnce(false);
    fetcher.mockResolvedValueOnce("valid value");
    onPoll.mockReturnValueOnce(true);

    const poller = createPoller(50, 5);
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

    const poller = createPoller(50, 5);
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

    const poller = createPoller(50, 3);
    const result = await poller.startPollingData();

    expect(result).toEqual({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  test("should stop polling when interval is reached", async () => {
    setInterval(() => onPoll.mockReturnValue(true), 300);

    const poller = createPoller(50, 3);
    const result = await poller.startPollingData();

    expect(result).toEqual({
      correctDataStateFound: false,
      maxAttemptsReached: true,
    });
  });
});
