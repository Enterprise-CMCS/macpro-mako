import { response } from "libs/handler-lib";
import { getSecret } from "shared-utils";

export const getSystemNotifs = async () => {
  try {
    const notifs = await getSecret(process.env.notificationSecretArn!);

    return response({
      statusCode: 200,
      body: JSON.parse(notifs) || [],
    });
  } catch (error: any) {
    console.error("Error:", error);
    return response({
      statusCode: 502,
      body: {
        error: error.message ? error.message : "Internal server error",
      },
    });
  }
};

export const handler = getSystemNotifs;
