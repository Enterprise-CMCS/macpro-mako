import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

export interface IdentifierCheckResult {
  exists: boolean;
  origin?: string;
}

/**
 * Checks if an identifier (SPA ID, Waiver ID) exists in the main index with case-insensitive matching.
 * Returns whether the identifier exists and its origin system if found.
 *
 * @param identifier - The identifier to check (case-insensitive)
 * @returns Object with exists flag and origin system name if found
 */
export async function checkIdentifierUsage(identifier: string): Promise<IdentifierCheckResult> {
  try {
    const { domain, index } = getDomainAndNamespace("main");

    // Use case-insensitive match query to find the identifier
    const query = {
      size: 1,
      query: {
        bool: {
          must: [
            {
              match: {
                id: {
                  query: identifier,
                  case_insensitive: true,
                },
              },
            },
          ],
          must_not: [
            {
              term: { deleted: true },
            },
          ],
        },
      },
    };

    const results = await os.search(domain, index, query);

    if (results?.hits?.hits?.length > 0) {
      const document = results.hits.hits[0];
      const origin = document._source?.origin as string | undefined;

      return {
        exists: true,
        origin: origin,
      };
    }

    return {
      exists: false,
    };
  } catch (error) {
    console.error("Error checking identifier usage:", error);
    // Return false on error to be safe - external systems can retry
    return {
      exists: false,
    };
  }
}
