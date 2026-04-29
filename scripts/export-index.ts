#!/usr/bin/env tsx

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import type { Client } from "@opensearch-project/opensearch";

import { getClient } from "../lib/libs/opensearch-lib";

interface ExportOptions {
  bucket: string;
  domain: string;
  batchSize?: number;
  keyPrefix?: string;
}

interface ScrollResponse {
  _scroll_id?: string;
  hits: {
    hits: Array<{ _source: unknown }>;
    total: {
      value: number;
      relation: string;
    };
  };
}

const INDEXES_TO_EXPORT = [
  "productionmain",
  "productionchangelog",
  "productiontypes",
  "productionsubtypes",
  "productioncpocs",
  "productioninsights",
  "productionlegacyinsights",
  "productionusers",
  "productionroles",
] as const;

class OpenSearchExporter {
  private s3Client: S3Client;
  private osClient: Client | null = null;
  private domain: string;
  private options: ExportOptions;

  constructor(options: ExportOptions) {
    this.options = options;
    this.s3Client = new S3Client({});
    this.domain = options.domain;
  }

  private async getOSClient(): Promise<Client> {
    if (!this.osClient) {
      this.osClient = await getClient(this.domain);
    }
    return this.osClient;
  }

  private async *scrollSearch(
    indexName: string,
    batchSize: number = 1000,
  ): AsyncGenerator<unknown[], void, unknown> {
    const client = await this.getOSClient();

    console.log(`Starting scroll search for index: ${indexName}`);

    try {
      // Initial search with scroll
      const initialResponse = await client.search({
        index: indexName,
        scroll: "2m", // Keep scroll context for 2 minutes
        size: batchSize,
        body: {
          query: { match_all: {} },
        },
      });

      console.log(`OpenSearch response status: ${JSON.stringify(initialResponse.meta)}`);

      // Check if response has expected structure
      if (!initialResponse.body || !initialResponse.body.hits) {
        console.error(
          `Unexpected response structure for ${indexName}:`,
          JSON.stringify(initialResponse, null, 2),
        );
        throw new Error(
          `Invalid response structure - missing hits property for index ${indexName}`,
        );
      }

      const responseBody = initialResponse.body as ScrollResponse;
      let hits = responseBody.hits.hits;
      let scrollId = responseBody._scroll_id;
      let totalRetrieved = hits.length;

      console.log(`Total documents in ${indexName}: ${responseBody.hits.total.value}`);
      console.log(`Retrieved batch 1: ${hits.length} documents`);

      if (hits.length > 0) {
        yield hits.map((hit) => hit._source);
      }

      // Continue scrolling while there are more results
      while (hits.length > 0 && scrollId) {
        const scrollResponse = await client.scroll({
          scroll_id: scrollId,
          scroll: "2m",
        });

        if (!scrollResponse.body || !scrollResponse.body.hits) {
          console.error(
            `Unexpected scroll response structure for ${indexName}:`,
            JSON.stringify(scrollResponse, null, 2),
          );
          break;
        }

        const scrollBody = scrollResponse.body as ScrollResponse;
        hits = scrollBody.hits.hits;
        scrollId = scrollBody._scroll_id;
        totalRetrieved += hits.length;

        if (hits.length > 0) {
          console.log(`Retrieved batch: ${hits.length} documents (total: ${totalRetrieved})`);
          yield hits.map((hit) => hit._source);
        }
      }

      // Clear scroll context
      if (scrollId) {
        try {
          await client.clearScroll({
            scroll_id: scrollId,
          });
        } catch (error) {
          console.warn(`Warning: Failed to clear scroll context: ${error}`);
        }
      }

      console.log(`Completed scrolling ${indexName}. Total documents retrieved: ${totalRetrieved}`);
    } catch (error) {
      console.error(`Error in scroll search for ${indexName}:`, error);
      if (error instanceof Error && "response" in error) {
        console.error(
          `OpenSearch error response:`,
          JSON.stringify((error as any).response, null, 2),
        );
      }
      throw error;
    }
  }

  private async exportIndexToS3(indexName: string): Promise<void> {
    console.log(`\n=== Exporting ${indexName} ===`);

    const allDocuments: unknown[] = [];

    try {
      const batchSize = this.options.batchSize || (indexName === "productionmain" ? 1000 : 5000);

      for await (const batch of this.scrollSearch(indexName, batchSize)) {
        allDocuments.push(...batch);
      }

      console.log(`Total documents collected for ${indexName}: ${allDocuments.length}`);

      // Upload to S3
      const s3Key = this.options.keyPrefix
        ? `${this.options.keyPrefix}/${indexName}.json`
        : `${indexName}.json`;

      console.log(`Uploading ${indexName}.json to S3...`);

      const putCommand = new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: s3Key,
        Body: JSON.stringify(allDocuments, null, 2),
        ContentType: "application/json",
        Metadata: {
          sourceIndex: indexName,
          exportedAt: new Date().toISOString(),
          documentCount: allDocuments.length.toString(),
        },
      });

      await this.s3Client.send(putCommand);
      console.log(`✅ Successfully exported ${indexName} to s3://${this.options.bucket}/${s3Key}`);
      console.log(`   Documents: ${allDocuments.length}`);
    } catch (error) {
      console.error(`❌ Failed to export ${indexName}:`, error);
      throw error;
    }
  }

  async exportAll(): Promise<void> {
    // Verify AWS credentials and S3 access
    console.log("Verifying AWS credentials...");
    const stsClient = new STSClient({});
    const identity = await stsClient.send(new GetCallerIdentityCommand({}));
    console.log(`✅ Authenticated as: ${identity.Arn}`);

    console.log(`Starting OpenSearch export to S3 bucket: ${this.options.bucket}`);
    console.log(`OpenSearch domain: ${this.domain}`);

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    for (const indexName of INDEXES_TO_EXPORT) {
      try {
        await this.exportIndexToS3(indexName);
        successCount++;
      } catch (error) {
        console.error(`Failed to export ${indexName}:`, error);
        errorCount++;
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n=== Export Summary ===`);
    console.log(`Total time: ${duration.toFixed(2)} seconds`);
    console.log(`Successful exports: ${successCount}`);
    console.log(`Failed exports: ${errorCount}`);
    console.log(`S3 bucket: ${this.options.bucket}`);

    if (errorCount > 0) {
      process.exit(1);
    }
  }
}

function parseArgs(argv: string[]): ExportOptions {
  let bucket = "";
  let domain = "";
  let batchSize: number | undefined;
  let keyPrefix: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "-b":
      case "--bucket":
        bucket = argv[index + 1] || "";
        index += 1;
        break;
      case "-d":
      case "--domain":
        domain = argv[index + 1] || "";
        index += 1;
        break;
      case "--batch-size": {
        const parsed = Number.parseInt(argv[index + 1] || "", 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          batchSize = parsed;
        }
        index += 1;
        break;
      }
      case "--key-prefix":
        keyPrefix = argv[index + 1];
        index += 1;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      default:
        break;
    }
  }

  if (!bucket) {
    console.error("Error: S3 bucket name is required");
    printUsage();
    process.exit(1);
  }

  if (!domain) {
    console.error("Error: OpenSearch domain URL is required");
    printUsage();
    process.exit(1);
  }

  return {
    bucket,
    domain,
    batchSize,
    keyPrefix: keyPrefix || `opensearch-exports/${new Date().toISOString().split("T")[0]}`,
  };
}

function printUsage() {
  console.log(`
Usage: tsx scripts/export-index.ts [OPTIONS]

Export OpenSearch production indexes to S3 as JSON files

OPTIONS:
  -b, --bucket <bucket>           S3 bucket name for export (required)
  -d, --domain <domain>           OpenSearch domain URL (required)
  --batch-size <size>             Batch size for scrolling (default: 1000 for main, 5000 for others)
  --key-prefix <prefix>           S3 key prefix for exported files
  -h, --help                      Show this help message

EXAMPLES:
  tsx scripts/export-index.ts --bucket my-export-bucket --domain https://vpc-domain.us-east-1.es.amazonaws.com
  tsx scripts/export-index.ts --bucket my-bucket --domain https://vpc-domain.us-east-1.es.amazonaws.com --key-prefix opensearch-exports/2024-04-28
`);
}

async function main(): Promise<void> {
  try {
    // Check if running in AWS CloudShell environment
    if (
      !process.env.AWS_EXECUTION_ENV &&
      !process.env.AWS_REGION &&
      !process.env.AWS_DEFAULT_REGION
    ) {
      console.warn(
        "⚠️  Warning: This script is designed to run in AWS CloudShell with VPC connectivity to OpenSearch.",
      );
      console.warn("   If you're not in CloudShell, make sure you have:");
      console.warn("   - Proper AWS credentials configured");
      console.warn("   - Network access to the OpenSearch domain");
      console.warn("   - Required IAM permissions");
      console.warn("");
    }

    const options = parseArgs(process.argv.slice(2));

    const exporter = new OpenSearchExporter(options);
    await exporter.exportAll();
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  Export interrupted by user");
  process.exit(130);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
