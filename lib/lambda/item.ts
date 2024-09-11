import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/api/auth/user";
import {
  getAppkChildren,
  getPackage,
  getPackageChangelog,
} from "../libs/api/package";
import { validateEnvVariable } from "shared-utils";

export const getItemData = async (event: APIGatewayEvent) => {
  validateEnvVariable("osDomain");
  console.log("Testing works!");
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body);
    const stateFilter = await getStateFilter(event);
    const packageResult = await getPackage(body.id);

    let appkChildren: any[] = [];
    if (packageResult._source.appkParent) {
      const children = await getAppkChildren(body.id);
      //Testing
      console.log("These are the children...", children);
      appkChildren = children.hits.hits;
    }
    const filter = [];
    // This is to handle hard deletes in legacy
    if (packageResult._source.legacySubmissionTimestamp !== null) {
      filter.push({
        range: {
          timestamp: {
            gte: new Date(
              packageResult._source.legacySubmissionTimestamp,
            ).getTime(),
          },
        },
      });
    }

    const changelog = await getPackageChangelog(body.id, filter);
    if (
      stateFilter &&
      (!packageResult._source.state ||
        !stateFilter.terms.state.includes(
          packageResult._source.state.toLocaleLowerCase(),
        ))
    ) {
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view this resource" },
      });
    }

    if (!packageResult.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }
    console.log(JSON.stringify(changelog, null, 2));

    return response<unknown>({
      statusCode: 200,
      body: {
        ...packageResult,
        _source: {
          ...packageResult._source,
          ...(!!appkChildren.length && { appkChildren }),
          changelog: changelog.hits.hits,
        },
      },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getItemData;

// Refactor to return appkchild title property with appkchild Document
// When appkchild is withdrawn, check to the changelog to see if it was a
// withdrawn appkchild ... And if it is withdrawn i should be looking 
// for its parent to get the appropiate title. 

// Check the changelog to see if its a withdrawn appkchild and if so pass 
// the title to the return statement. 
