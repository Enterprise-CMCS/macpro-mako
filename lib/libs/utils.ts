import { BaseIndex, Index } from "lib/packages/shared-types/opensearch";

/**
 * Returns the `osDomain`
 * @throws if env variables are not defined, `getDomain` throws error indicating if variable is missing
 * @returns the value of `osDomain`
 */
export function getDomain(): string {
  const domain = process.env.osDomain;
  if (domain === undefined) {
    throw new Error("process.env.osDomain must be defined");
  }
  return domain;
}

/**
 * Returns the `indexNamespace` and `baseIndex` combined
 * process.env.indexNamespace (THIS SHOULD BE THE BRANCH NAME & SHOULD ALWAYS BE DEFINED)
 * @throws if process.env.indexNamespace not defined.
 * @returns the value of `indexNamespace` and `baseIndex` combined
 */

export function getOsNamespace(baseIndex: BaseIndex): Index {
  const indexNamespace = process.env.indexNamespace;

  if (!indexNamespace) {
    throw new Error("process.env.indexNamespace must be defined");
  }

  return `${indexNamespace}${baseIndex}`;
}

/**
 * Gets both the OpenSearch domain and namespace combined with the base index
 * @param baseIndex - The base index to combine with the namespace
 * @throws {Error} If required environment variables are not defined
 * @returns Object containing:
 *  - domain: The OpenSearch domain from environment variables
 *  - index: The namespace and base index combined
 */

export function getDomainAndNamespace(baseIndex: BaseIndex) {
  const domain = getDomain();
  const index = getOsNamespace(baseIndex);

  return { index, domain };
}
