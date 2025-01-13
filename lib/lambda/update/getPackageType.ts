import { response } from "libs/handler-lib";
import { events } from "shared-types";
import { getPackageChangelog } from "libs/api/package";

export const getPackageType = async (packageId: string) => {
  // use event of current package to determine how ID should be formatted
  try {
    const packageChangelog = await getPackageChangelog(packageId);
    const packageSubmissionType = packageChangelog.hits.hits.find(
      (pkg) => pkg._source.event in events,
    );

    if (!packageSubmissionType) {
      throw new Error("The type of package could not be determined.");
    }

    return packageSubmissionType._source.event;
  } catch (error) {
    return response({
      statusCode: 500,
      body: {
        message: error.message || "An error occurred determining the package submission type.",
      },
    });
  }
};
