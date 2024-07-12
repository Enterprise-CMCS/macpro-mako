import {
  WithdrawPackage,
  withdrawPackageSchema,
  SEATOOL_STATUS,
  Action,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";

export async function withdrawPackage(body: WithdrawPackage) {
  console.log("State withdrawing a package.");
  // Check incoming data
  const result = withdrawPackageSchema.safeParse(body);
  if (result.success === false) {
    console.error(
      "Withdraw Package event validation error. The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: { message: "Withdraw Package event validation error" },
    });
  }
  // Begin query (data is confirmed)
  const today = seaToolFriendlyTimestamp();
  await packageActionWriteService.withdrawPackage({
    ...result.data,
    action: Action.WITHDRAW_PACKAGE,
    id: result.data.id,
    spwStatus: SEATOOL_STATUS.WITHDRAWN,
    timestamp: today,
    topicName: TOPIC_NAME,
  });
}
