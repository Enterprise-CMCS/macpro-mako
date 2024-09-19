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
    const packageResult = await getPackage(body.id); // Add another line here for getting the intened parent to pass on later for the title


    let appkChildren: any[] = [];
    if (packageResult._source.appkParent) {
      const children = await getAppkChildren(body.id);
      //Testing

      //console.log("These are the children...", children);
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

    // Return the whole package
    //console.log('This is the Package Result', packageResult);

    // see if its a child appk that has been withdrawn
    const appKChildRemoved = changelog.hits.hits.find(changeLogItem => changeLogItem._source.actionType === "remove-appk-child");

    if (appKChildRemoved) {
      // fetch parent id from it
      // await getPackage(appKChildRemoved._source.appkParentId)
      // packageResult: set the appkTitle
      //console.log("Step 1..check if childappk is removed", appKChildRemoved._source.appkParentId)
      //console.log("Step 2.. get parentid", appKChildRemoved._source)
    }

    // Return the title from the parent
    const pTitle = packageResult._source.appkTitle;
    //console.log("This is the", pTitle);

    // Check to see if appkchild is in withdrawn state
    const appChildWithdrawnState = packageResult._source.actionType;

    //console.log("This is the", appChildWithdrawnState);

    // Probably have to loop over the change log to get the

    // array of the history of everything that has happened to the record
    // if there is an entry that say it used to be a app-k child and was withdrawn
    // determine if this record is an app-k child
    // query for the parent id from that entry

    console.log("what the heck is in the changelog (B.F.):", JSON.stringify(changelog));
    console.log("This is the parent id: ", packageResult._id)



    // The title that you got from the parent pass to the child
    const theChildren = packageResult._source.appkChildren;
    //console.log('This title should pass to the ', theChildren);

    /*
    if(packageResult){
      // get the pTitle
      
      // check to see if package is withdrawn
      if(appChildWithdrawnState){

      }
    }
      

       
    */


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
