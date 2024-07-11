import {
  RaiResponse,
  raiResponseSchema,
  SEATOOL_STATUS,
  Action,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { ExtendedItemResult } from "../../../libs/package";
import { type PackageActionWriteService } from "../services/package-action-write-service";

export async function respondToRai(
  body: RaiResponse,
  document: ExtendedItemResult["_source"],
  packageActionWriteService: PackageActionWriteService = globalThis.packageActionWriteService,
) {
  console.log("State responding to RAI");
  if (!document.raiRequestedDate) {
    return response({
      statusCode: 400,
      body: {
        message: "No candidate RAI available",
      },
    });
  }
  const raiToRespondTo = new Date(document.raiRequestedDate).getTime();
  const today = seaToolFriendlyTimestamp();
  const result = raiResponseSchema.safeParse({
    ...body,
    responseDate: today,
    requestedDate: raiToRespondTo,
  });
  if (result.success === false) {
    console.error(
      "validation error:  The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: {
        message: "Event validation error",
      },
    });
  }

  try {
    await packageActionWriteService.respondToRai({
      action: Action.RESPOND_TO_RAI,
      id: result.data.id,
      raiReceivedDate: document.raiReceivedDate!,
      raiToRespondTo: raiToRespondTo,
      raiWithdrawnDate: document.raiWithdrawnDate!,
      responseDate: today,
      spwStatus: SEATOOL_STATUS.PENDING,
      timestamp: today,
      topicName: TOPIC_NAME,
    });
  } catch (err) {
    // Rollback and log
    console.error(err);
    return response({
      statusCode: 500,
      body: err instanceof Error ? { message: err.message } : err,
    });
  }
}
