import { SEATOOL_STATUS, Action } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler-lib";
import { TOPIC_NAME } from "../consts";
import { ExtendedItemResult } from "../../../libs/api/package";
import { respondToRaiAction } from "../services/package-action-write-service";
export async function respondToRai(
  body: any,
  document: Pick<ExtendedItemResult["_source"], "raiReceivedDate" | "raiRequestedDate" | "raiWithdrawnDate">,
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
  const result = await respondToRai(body, document);
  if (result.statusCode !== 200) {
    console.error(
      "validation error:  The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.body,
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
      action: Action.RESPOND_TO_RAI,
      raiReceivedDate: document.raiReceivedDate!,
      raiRequestedDate: raiToRespondTo,
      raiWithdrawnDate: document.raiWithdrawnDate!,
      spwStatus: SEATOOL_STATUS.PENDING,
      today,
      timestamp: now,
      topicName: TOPIC_NAME,
      responseDate: today,
      id: body.id,
      raiToRespondTo,
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
