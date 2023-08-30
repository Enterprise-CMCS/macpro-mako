import { OsAggBucket } from "shared-types";

export const mapOsBucketToOption = (bucket: OsAggBucket) => {
  return {
    label: bucket.key,
    value: bucket.key,
  };
};
