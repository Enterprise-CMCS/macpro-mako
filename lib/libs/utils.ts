import { BaseIndex, Index } from "lib/packages/shared-types/opensearch";

export function getDomain(): string {
  const domain = process.env.osDomain;
  if (domain === undefined) {
    throw new Error("process.env.osDomain must be defined");
  }
  return domain;
}

export function getOsNamespace(baseIndex: BaseIndex): Index {
  const indexNamespace = process.env.indexNamespace;

  if (!indexNamespace) {
    throw new Error("process.env.indexNamespace must be defined");
  }

  return `${indexNamespace}${baseIndex}`;
}

export function getDomainAndNamespace(baseIndex: BaseIndex) {
  const domain = getDomain();
  const index = getOsNamespace(baseIndex);

  return { index, domain };
}
