import { http, HttpResponse } from "msw";
import { BannerNotification } from "shared-types";

export type NotifRequestBody = BannerNotification[];

const defaultApiNotificationHandler = http.get<any, NotifRequestBody>(
  /\/systemNotifs/,
  async () => {
    return HttpResponse.json(
      [
        {
          notifId: "testId",
          header: "testHeader",
          body: "testBody",
          buttonText: "button",
          buttonLink: "link",
          pubDate: new Date().toISOString(),
          expDate: new Date().toISOString(),
          disabled: false,
        },
        {
          header: "testHeader",
          body: "testBody",
          buttonText: "button",
          buttonLink: "link",
          pubDate: new Date().toISOString(),
          expDate: new Date().toISOString(),
          disabled: false,
        },
      ],
      { status: 200 },
    );
  },
);

export const errorApiNotificationHandler = http.get<any, NotifRequestBody>(
  /\/systemNotifs/,
  async () => HttpResponse.json([], { status: 500 }),
);

export const notificationHandlers = [defaultApiNotificationHandler];
