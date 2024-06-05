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
    }>((resolve, _reject) => {
      let timesPolled = 0;

      const intervalId = setInterval(async () => {
        timesPolled++;
        if (timesPolled <= this.options.pollAttempts) {
          const data = await this.options.fetcher();
          const stopPoll = this.options.onPoll(data);

          if (stopPoll) {
            resolve({
              correctDataStateFound: true,
              maxAttemptsReached: false,
            });
            clearInterval(intervalId);
          }
        } else {
          resolve({
            correctDataStateFound: false,
            maxAttemptsReached: true,
          });
          clearInterval(intervalId);
        }
      }, this.options.interval);
    });
  }
}
