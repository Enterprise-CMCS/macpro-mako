export type Options<TFetcherReturn> = {
  fetcher: () => TFetcherReturn;
  onPoll: (data: Awaited<TFetcherReturn>) => boolean;
  interval: number;
  pollAttempts: number;
};

export class DataPoller<TFetcherReturn> {
  private options: Options<TFetcherReturn>;

  constructor(options: Options<TFetcherReturn>) {
    this.options = options;
  }

  async startPollingData() {
    return new Promise<{
      maxAttemptsReached: boolean;
      correctDataStateFound: boolean;
      error?: string;
    }>((resolve, reject) => {
      let timesPolled = 0;
      let errorMessage: string | null = null;

      const intervalId = setInterval(async () => {
        timesPolled++;
        if (timesPolled <= this.options.pollAttempts) {
          errorMessage = null;

          try {
            const data = await this.options.fetcher();
            if (data) {
              const stopPoll = this.options.onPoll(data);
              if (stopPoll) {
                resolve({
                  correctDataStateFound: true,
                  maxAttemptsReached: false,
                });
                clearInterval(intervalId);
              }
            }
          } catch (error) {
            const message = error instanceof Error ? (error as Error).message : error;
            errorMessage = `Error fetching data: ${message}`;
          }
        } else {
          reject({
            correctDataStateFound: false,
            maxAttemptsReached: true,
            message:
              errorMessage ||
              "Error polling data: Correct data state not found, after max attempts reached",
          });
          clearInterval(intervalId);
        }
      }, this.options.interval);
    });
  }
}
