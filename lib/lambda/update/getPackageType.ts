import { response } from "lib/libs/handler-lib";
import { events } from "lib/packages/shared-types";
import { getPackageChangelog } from "lib/libs/api/package";

export const getPackageType = async (packageId: string) => {
  // use event of current package to determine how ID should be formatted
  try {
    const packageChangelog = await getPackageChangelog(packageId);
    if (!packageChangelog.hits.hits.length) {
      throw new Error("The type of package could not be determined.");
    }

    const packageWithSubmissionType = packageChangelog.hits.hits.find((pkg) => {
      return pkg._source.event in events;
    });
    const packageEvent = packageWithSubmissionType?._source.event;

    return packageEvent;
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: error },
    });
  }
};
