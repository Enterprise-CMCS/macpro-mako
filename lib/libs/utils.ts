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
 * Returns the `indexNamespace` env variables. Passing `baseIndex` appends the arg to the `index` variable
 * @throws if env variables are not defined, `getNamespace` throws error indicating if variable is missing and
 * the environment the application is running on `isDev`
 * @returns the value of `indexNamespace` or empty string if not in development
 */
export function getNamespace<T extends BaseIndex>(baseIndex?: T): Index;
export function getNamespace(baseIndex?: BaseIndex) {
  const indexNamespace = process.env.topicNamespace ?? "";

  if (indexNamespace == "" && process.env.isDev == "true") {
    throw new Error("process.env.topicNamespace must be defined");
  }

  const index = `${indexNamespace}${baseIndex}`;

  return index;
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
  const index = getNamespace(baseIndex);

  return { index, domain };
}
