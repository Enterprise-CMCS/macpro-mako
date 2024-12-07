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

          let data: Awaited<TFetcherReturn> | null = null;
          let stopPoll: boolean = false;

          try {
            data = await this.options.fetcher();
          } catch (error) {
            errorMessage = `Error fetching: ${error.message}`;
          }

          if (data) {
            try {
              stopPoll = this.options.onPoll(data);
            } catch (error) {
              errorMessage = `Error polling: ${error.message}`;
            }
          }

          if (stopPoll) {
            resolve({
              correctDataStateFound: true,
              maxAttemptsReached: false,
            });
            clearInterval(intervalId);
          }
        } else {
          reject({
            correctDataStateFound: false,
            maxAttemptsReached: true,
            error:
              errorMessage ||
              "Error polling data: Correct data state not found, after max attempts reached",
          });
          clearInterval(intervalId);
        }
      }, this.options.interval);
    });
  }
}
