import { BaseIndex, Index } from "lib/packages/shared-types/opensearch";

/**
 * Returns the `osDomain`
 * @throws if env variables are not defined, `getDomain` throws error indicating if variable is missing
 * @returns the value of `osDomain`
 */
export function getDomain(): string;
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
export function getOsNamespace<T extends BaseIndex>(baseIndex: T): Index;
export function getOsNamespace(baseIndex: BaseIndex) {
  const indexNamespace = process.env.indexNamespace;

  if (!indexNamespace) {
    throw new Error("process.env.indexNamespace must be defined");
  }

  return `${indexNamespace}${baseIndex}`;
}

/**
 * Returns the `osDomain` and `indexNamespace` env variables. Passing `baseIndex` appends the arg to the `index` variable
 * @throws if env variables are not defined, `getDomainAndNamespace` throws error indicating which variable is missing
 * @returns
 */
export function getDomainAndNamespace<T extends BaseIndex>(
  baseIndex: T,
): { domain: string; index: Index };

export function getDomainAndNamespace(baseIndex: BaseIndex) {
  const domain = getDomain();
  const index = getOsNamespace(baseIndex);

  return { index, domain };
}
