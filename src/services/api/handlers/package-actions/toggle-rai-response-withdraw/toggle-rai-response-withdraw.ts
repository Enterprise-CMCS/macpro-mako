import {
  ToggleWithdrawRaiEnabled,
  toggleWithdrawRaiEnabledSchema,
  Action,
} from "shared-types";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { getIdsToUpdate } from "../get-id-to-update";
import { TOPIC_NAME } from "../consts";

export async function toggleRaiResponseWithdraw(
  body: ToggleWithdrawRaiEnabled,
  toggle: boolean,
) {
  const result = toggleWithdrawRaiEnabledSchema.safeParse({
    ...body,
    raiWithdrawEnabled: toggle,
  });
  if (result.success === false) {
    console.error(
      "Toggle Rai Response Withdraw Enable event validation error. The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: {
        message: "Toggle Rai Response Withdraw Enable event validation error",
      },
    });
  }
  try {
    const idsToUpdate = await getIdsToUpdate(result.data.id);
    for (const id of idsToUpdate) {
      await produceMessage(
        TOPIC_NAME,
        id,
        JSON.stringify({
          actionType: toggle
            ? Action.ENABLE_RAI_WITHDRAW
            : Action.DISABLE_RAI_WITHDRAW,
          ...result.data,
          id,
        }),
      );
    }

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
