import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomain } from "libs/utils";

import { getStateFilter } from "../libs/api/auth/user";
import { getPackage, getPackageChangelog } from "../libs/api/package";
import { generatePresignedDownloadUrl } from "./presignedAttachmentUrl";
import { handleOpensearchError } from "./utils";

// Handler function to get Seatool data
export const handler = async (event: APIGatewayEvent) => {
  try {
    getDomain();
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: `ERROR: ${error?.message || error}` },
    });
  }

  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const body = JSON.parse(event.body);

    const mainResult = await getPackage(body.id);
    if (!mainResult || !mainResult.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      const stateAccessAllowed = stateFilter?.terms.state.includes(
        mainResult?._source?.state?.toLocaleLowerCase() || "",
      );

      if (!stateAccessAllowed) {
        return response({
          statusCode: 403,
          body: { message: "state access not permitted for the given id" },
        });
      }
    }

    // add state
    // Do we want to check
    const changelogs = await getPackageChangelog(body.id);
    const attachmentExists = changelogs.hits.hits.some((CL) => {
      return CL._source.attachments?.some(
        (ATT) => ATT.bucket === body.bucket && ATT.key === body.key,
      );
    });
    if (!attachmentExists) {
      return response({
        statusCode: 500,
        body: {
          message: "Attachment details not found for given record id.",
        },
      });
    }

    // Now we can generate the presigned url
    const url = await generatePresignedDownloadUrl(body.bucket, body.key, body.filename, 60);

    return response<unknown>({
      statusCode: 200,
      body: { url },
    });
  } catch (error) {
    return response(handleOpensearchError(error));
  }
};
