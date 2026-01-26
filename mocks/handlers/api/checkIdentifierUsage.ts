import { http, HttpResponse } from "msw";

import items, { TEST_ITEM_ID, NOT_FOUND_ITEM_ID, GET_ERROR_ITEM_ID } from "../../data/items";

/**
 * Helper function to find an item by ID with case-insensitive matching
 */
function findItemByIdentifier(identifier: string) {
  // Case-insensitive search through items
  const normalizedId = identifier.toLowerCase();
  return Object.values(items).find(
    (item) => item._id?.toLowerCase() === normalizedId && !item._source?.deleted,
  );
}

const defaultApiCheckIdentifierUsageHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/checkIdentifierUsage",
  async ({ request }) => {
    const url = new URL(request.url);
    const identifier = url.searchParams.get("id");

    // Missing id parameter
    if (!identifier) {
      return HttpResponse.json(
        { message: "Missing required parameter: id" },
        { status: 400 },
      );
    }

    // Error case for testing
    if (identifier === GET_ERROR_ITEM_ID) {
      return HttpResponse.json({ message: "Internal server error" }, { status: 500 });
    }

    // Find item with case-insensitive matching
    const item = findItemByIdentifier(identifier);

    if (item && item._source) {
      return HttpResponse.json({
        inUse: true,
        system: item._source.origin || undefined,
      });
    }

    // Not found
    return HttpResponse.json({
      inUse: false,
    });
  },
);

export const errorApiCheckIdentifierUsageHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/checkIdentifierUsage",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const checkIdentifierUsageHandlers = [defaultApiCheckIdentifierUsageHandler];
