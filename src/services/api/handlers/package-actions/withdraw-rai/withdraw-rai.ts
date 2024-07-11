import {
  RaiWithdraw,
  raiWithdrawSchema,
  SEATOOL_STATUS,
  Action,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";

import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { PackageActionWriteService } from "../services/package-action-write-service";
import { ExtendedItemResult } from "../../../libs/package";

export async function withdrawRai(
  body: RaiWithdraw,
  document: ExtendedItemResult["_source"],
  packageActionWriteService: PackageActionWriteService = globalThis.packageActionWriteService,
) {
  console.log("State withdrawing an RAI Response");
  if (!document.raiRequestedDate || !document.raiReceivedDate) {
    return response({
      statusCode: 400,
      body: {
        message: "No candidate RAI available",
      },
    });
  }

  const raiToWithdraw = new Date(document.raiRequestedDate).getTime();
  const today = seaToolFriendlyTimestamp();
  const result = raiWithdrawSchema.safeParse({
    ...body,
    requestedDate: raiToWithdraw,
    withdrawnDate: today,
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

  await packageActionWriteService.withdrawRai({
    ...result.data,
    action: Action.WITHDRAW_RAI,
    id: result.data.id,
    spwStatus: SEATOOL_STATUS.PENDING_RAI,
    timestamp: today,
    topicName: TOPIC_NAME,
    raiToWithdraw,
    raiRequestedDate: document.raiRequestedDate,
    raiReceivedDate: document.raiReceivedDate,
  });
}
