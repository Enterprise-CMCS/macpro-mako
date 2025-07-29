import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { updatePackage } from "./update/updatePackage";
// import { getAvailableActions } from "shared-utils";

import {
    getAuthDetails,

    lookupUserAttributes,
} from "../libs/api/auth/user";
import { getPackage } from "../libs/api/package/getPackage";
import { getLatestActiveRoleByEmail } from "./user-management/userManagementService";
// import { handleOpensearchError } from "./utils";

export const softDeletePackage = async (event: APIGatewayEvent) => {
    console.log("soft delete package lambda executed")
    if (!event.body) {
        return response({
            statusCode: 400,
            body: { message: "Event body required" },
        });
    }

    try {
        const body = JSON.parse(event.body);
        console.log("event body: ", event.body);
        console.log("package id from API Gateway Event: ", body.id);
        let updatedEventBody = {
            packageId: body.id,
            action: "delete",
        };
        event.body = JSON.stringify(updatedEventBody);
        const resp = await updatePackage(event).then(() => {
            console.log("response gtom updatePackage lambda: ", resp);
        })
        // const result = await getPackage(body.id);

        // if (result === undefined || !result.found) {
        //     return response({
        //         statusCode: 404,
        //         body: { message: "No record found for the given id" },
        //     });
        // }

        const authDetails = getAuthDetails(event);
        const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
        console.log("user Id: ", authDetails.userId);
        const activeRole = await getLatestActiveRoleByEmail(userAttr.email);

        if (!activeRole) {
            return response({
                statusCode: 401,
                body: {
                    message: "No active role found for user",
                },
            });
        }

        // const passedStateAuth = await isAuthorizedToGetPackageActions(event, result._source.state);

        // if (!passedStateAuth)
        //     return response({
        //         statusCode: 403,
        //         body: { message: "Not authorized to view resources from this state" },
        //     });

        return response({
            statusCode: 200,
            body: {
                result: "some result ",
            },
        });
    } catch (err) {
        console.log("soft delete package error");
    }
};
export const handler = softDeletePackage;
