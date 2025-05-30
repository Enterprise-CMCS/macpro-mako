import { http, HttpResponse } from "msw";

const defaultIDMHandler = http.get(
  "https://dimauthzendpoint.com/api/v1/authz/id/all",
  async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("userId");

    if (id === "fail") {
      return HttpResponse.json({ text: "Failed to retrieve user" }, { status: 401 });
    }
    if (id === "abcd") {
      return HttpResponse.json(
        {
          userProfileAppRoles: {
            userRolesInfoList: [
              {
                roleName: "statesubmitter",
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
