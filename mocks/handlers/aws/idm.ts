import { http, HttpResponse } from "msw";

const defaultIDMHandler = http.get(
  "https://dimauthzendpoint.com/api/v1/authz/id/all?userId=:id",
  async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("userId");

    if (id === "fail") {
      return HttpResponse.json({ text: "Failed to retrieve user" }, { status: 401 });
    } else if (id === "abcd") {
      return HttpResponse.json(
        {
          userProfileAppRoles: {
            userRolesInfoList: [
              {
                roleName: "onemac-micro-statesubmitter",
                roleAttributes: [{ name: "State/Territory", value: "VA" }],
              },
            ],
          },
        },
        { status: 200 },
      );
    }
    return HttpResponse.json({ text: "Failed to retrieve user" }, { status: 200 });
  },
);

export const idmHandlers = [defaultIDMHandler];
