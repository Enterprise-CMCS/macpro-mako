export type Options<TFetcherReturn> = {
  fetcher: () => TFetcherReturn;
  checkStatus: (data: Awaited<TFetcherReturn>) => boolean;
  interval: number;
  pollAttempts: number;
};

export class DataPoller<TFetcherReturn> {
  private options: Options<TFetcherReturn>;
  isCorrectStatus = false;

  constructor(options: Options<TFetcherReturn>) {
    this.options = options;
  }

  async startPollingData() {
    return new Promise<{
      maxAttemptsReached: boolean;
      correctStatusFound: boolean;
    }>((resolve, _reject) => {
      let timesPolled = 0;

      const intervalId = setInterval(async () => {
        timesPolled++;
        if (timesPolled <= this.options.pollAttempts) {
          const data = await this.options.fetcher();
          const correctStatus = this.options.checkStatus(data);

          if (correctStatus) {
            resolve({
              correctStatusFound: true,
              maxAttemptsReached: false,
            });
            clearInterval(intervalId);
          }
        } else {
          resolve({
            correctStatusFound: false,
            maxAttemptsReached: true,
          });
          clearInterval(intervalId);
        }
      }, this.options.interval);
    });
  }
}
