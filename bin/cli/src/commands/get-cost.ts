import { Argv } from "yargs";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";
import { checkIfAuthenticated, setStageFromBranch, project } from "../lib";

export const getCost = {
  command: "get-cost",
  describe: "get cost of an environment",
  builder: (yargs: Argv) => {
    return yargs.option("stage", {
      type: "string",
      demandOption: false,
    });
  },
  handler: async (options: { stage?: string; stack?: string }) => {
    await checkIfAuthenticated();
    const stage = options.stage || (await setStageFromBranch());
    const tags = {
      PROJECT: [project],
      STAGE: [stage],
    };

    const today = new Date();
    const endDate = new Date(today.setDate(today.getDate() - 1)); // Yesterday
    endDate.setUTCHours(23, 59, 59, 999); // Set end date to the end of yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 13); // 14 days ago not including today
    startDate.setUTCHours(0, 0, 0, 0); // Set start date to the beginning of the day

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const dailyCosts = await getDailyStackCosts(tags, start, end);
    const yesterdayCost = dailyCosts[dailyCosts.length - 1].cost;
    const averageDailyCost =
      dailyCosts.reduce((acc, day) => acc + day.cost, 0) / dailyCosts.length;

    console.log(`Daily costs for the last 14 days:`);
    dailyCosts.forEach((day) => {
      console.log(`${day.date}: $${day.cost.toFixed(2)}`);
    });
    console.log(
      `Average daily cost over the past 14 days: $${averageDailyCost.toFixed(
        2,
      )}`,
    );
    console.log(
      `Yesterday, the stack ${stage} cost $${yesterdayCost.toFixed(2)}.`,
    );
  },
};

/**
 * Fetches the daily costs associated with specified tags within a given date range.
 *
 * @param {Record<string, string[]>} tags - An object containing tag keys and their respective values.
 * @param {string} startDate - The start date for the cost retrieval period in YYYY-MM-DD format.
 * @param {string} endDate - The end date for the cost retrieval period in YYYY-MM-DD format.
 * @returns {Promise<{date: string, cost: number}[]>} - An array of daily costs associated with the specified tags.
 * @throws {Error} - If there is any issue fetching the cost.
 */
export async function getDailyStackCosts(
  tags: Record<string, string[]>,
  startDate: string,
  endDate: string,
): Promise<{ date: string; cost: number }[]> {
  const client = new CostExplorerClient({ region: "us-east-1" });
  const tagFilters = Object.keys(tags).map((key) => ({
    Key: key,
    Values: tags[key],
  }));

  const command = new GetCostAndUsageCommand({
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Granularity: "DAILY",
    Filter: {
      And: tagFilters.map((tagFilter) => ({ Tags: tagFilter })),
    },
    Metrics: ["BlendedCost"],
  });

  try {
    const response = await client.send(command);
    const results = response.ResultsByTime || [];

    return results.map((result) => ({
      date: result.TimePeriod?.Start || "",
      cost: result.Total?.BlendedCost?.Amount
        ? parseFloat(result.Total.BlendedCost.Amount)
        : 0,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch cost: ${error}`);
  }
}
