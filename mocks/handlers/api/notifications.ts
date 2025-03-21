import { http, HttpResponse } from "msw";
import { BannerNotification } from "shared-types";

export type NotifRequestBody = BannerNotification[];

const defaultNotificationHandler = http.get<any, NotifRequestBody>(/\/systemNotifs/, async () => {
  return HttpResponse.json(
    [
      {
        notifId: "testId",
        body: "testBody",
        header: "testHeader",
        pubDate: new Date().toISOString(),
      },
    ],
    { status: 200 },
  );
});

export const notificationHandlers = [defaultNotificationHandler];
