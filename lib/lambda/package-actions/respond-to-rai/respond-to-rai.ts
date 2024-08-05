import { raiResponseSchema, SEATOOL_STATUS, Action } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler-lib";
import { TOPIC_NAME } from "../consts";
import { ExtendedItemResult } from "../../../libs/api/package";
import { respondToRaiAction } from "../services/package-action-write-service";

export async function respondToRai(
  body: any,
  document: Pick<
    ExtendedItemResult["_source"],
    "raiReceivedDate" | "raiRequestedDate" | "raiWithdrawnDate"
  >,
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
  const now = new Date().getTime();
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
    await respondToRaiAction({
      ...result.data,
      action: Action.RESPOND_TO_RAI,
      id: result.data.id,
      raiReceivedDate: document.raiReceivedDate!,
      raiToRespondTo: raiToRespondTo,
      raiWithdrawnDate: document.raiWithdrawnDate!,
      responseDate: today,
      spwStatus: SEATOOL_STATUS.PENDING,
      today,
      timestamp: now,
      topicName: TOPIC_NAME,
    });
    return response({
      statusCode: 200,
      body: {
        message: "record successfully submitted",
      },
    });
  } catch (err) {
    console.log(err);

    return response({
      statusCode: 500,
    });
  }
}
