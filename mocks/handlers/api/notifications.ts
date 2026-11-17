import { http, HttpResponse } from "msw";
import { BannerNotification } from "shared-types";

export type NotifRequestBody = BannerNotification[];

const defaultApiNotificationHandler = http.get<any, NotifRequestBody>(
  /\/systemNotifs/,
  async () => {
    const now = Date.now();
    return HttpResponse.json(
      [
        {
          notifId: "centra-oy2-43057",
          header: "Community Engagement Short-Term Hardship Exception",
          body: "State users can submit a Community Engagement Short-Term Hardship Exception from the Medicaid SPA submission flow. Use submission ID format SS-CE-YY-###, for example MD-CE-26-001.",
          buttonText: "View Community Engagement FAQs",
          buttonLink: "/faq/centra-id-format",
          pubDate: new Date(now - 60_000).toISOString(),
          expDate: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString(),
          disabled: false,
        },
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
