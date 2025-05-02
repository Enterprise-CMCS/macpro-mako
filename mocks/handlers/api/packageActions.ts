import { APIGatewayEvent } from "aws-lambda";
import { isAuthorizedToGetPackageActions } from "libs/api/auth/user";
import { http, HttpResponse, PathParams } from "msw";
import { opensearch } from "shared-types";
import { getAvailableActions } from "shared-utils";

import items from "../../data/items";
import { getRequestContext, mockUseGetUser } from "../../index";
import { PackageActionsRequestBody } from "../../index.d";

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

    const passedStateAuth = await isAuthorizedToGetPackageActions(
      {
        requestContext: getRequestContext(),
      } as APIGatewayEvent,
      item._source.state,
    );
    const currUser = mockUseGetUser()?.data?.user;
    if (!passedStateAuth || !currUser) {
      return HttpResponse.json(
        { message: "Not authorized to view resources from this state" },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      getAvailableActions(
        { ...currUser, role: "statesubmitter" },
        item._source as opensearch.main.Document,
      ) || [],
    );
  },
);

export const onceApiPackageActionsHandler = (doc: opensearch.main.Document) =>
  http.post<PathParams, PackageActionsRequestBody>(
    "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getPackageActions",
    async () => {
      if (!doc) {
        return HttpResponse.json([]);
      }

      const passedStateAuth = await isAuthorizedToGetPackageActions(
        {
          requestContext: getRequestContext(),
        } as APIGatewayEvent,
        doc.state,
      );
      const currUser = mockUseGetUser()?.data?.user;
      if (!passedStateAuth || !currUser) {
        return HttpResponse.json(
          { message: "Not authorized to view resources from this state" },
          { status: 401 },
        );
      }

      return HttpResponse.json({
        actions: getAvailableActions(currUser, doc) || [],
      });
    },
    { once: true },
  );

export const errorApiPackageActionsHandler = http.post<PathParams, PackageActionsRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getPackageActions",
  () => new HttpResponse(null, { status: 500 }),
);

export const packageActionHandlers = [defaultApiPackageActionsHandler];
