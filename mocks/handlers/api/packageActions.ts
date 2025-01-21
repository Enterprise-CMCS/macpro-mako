import { http, HttpResponse, PathParams } from "msw";
import { PackageActionsRequestBody, mockUseGetUser } from "mocks";
import items from "mocks/data/items";
import { opensearch, UserRoles } from "shared-types";
import { getAvailableActions } from "shared-utils";

const defaultApiPackageActionsHandler = http.post<PathParams, PackageActionsRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getPackageActions",

  async ({ request }) => {
    const { id } = await request.json();

    if (!id) {
      return HttpResponse.json({ message: "Event body required" }, { status: 400 });
    }

    const item = items[id];
    if (!item?._source?.state) {
      return HttpResponse.json({ message: "No record found for the given id" }, { status: 404 });
    }

    const currUser = mockUseGetUser()?.data?.user;
    const userRoles = (currUser?.["custom:cms-roles"] as string) || "";
    const userStates = (currUser?.["custom:state"] as string) || "";
    if (
      !currUser ||
      !userRoles.includes(UserRoles.STATE_SUBMITTER) ||
      !userStates.includes(item._source.state)
    ) {
      return HttpResponse.json(
        { message: "Not authorized to view resources from this state" },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      getAvailableActions(currUser, item._source as opensearch.main.Document) || [],
    );
  },
);

export const errorApiPackageActionsHandler = http.post<PathParams, PackageActionsRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getPackageActions",
  () => new HttpResponse(null, { status: 500 }),
);

export const packageActionHandlers = [defaultApiPackageActionsHandler];
