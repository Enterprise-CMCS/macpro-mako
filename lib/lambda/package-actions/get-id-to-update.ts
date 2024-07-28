import { opensearch } from "shared-types";
import { getAppkChildren } from "../../libs/api/package";
import { getItem } from "libs";

export async function getIdsToUpdate(id: string) {
  console.log(process.env.osDomain);
  console.log(id);
  const og = (await getItem(
    process.env.osDomain!,
    `${process.env.indexNamespace}main`,
    id,
  )) as opensearch.main.ItemResult;
  if (!og) {
    throw "Package doesn't exist, and it should.";
  }
  console.log(JSON.stringify(og, null, 2));
  const idsToUpdate = [og._id];
  if (og._source.appkParent) {
    const children = await getAppkChildren(og._id);
    children.hits?.hits?.forEach((child) => {
      idsToUpdate.push(child._id);
    });
  }
  return idsToUpdate;
}
