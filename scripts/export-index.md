# OpenSearch to S3 Export Script

This script exports all production OpenSearch indexes to S3 as JSON files. It's designed to run in AWS CloudShell with VPC connectivity to your OpenSearch domain.

## Prerequisites

- AWS CloudShell with VPC connectivity to the OpenSearch domain
- Appropriate IAM permissions for:
  - Reading from OpenSearch domain
  - Writing to S3 bucket
  - Getting caller identity (STS)

## Setup Instructions

### 1. Login to AWS CloudShell

- Open AWS CloudShell in your browser
- Ensure you have VPC connectivity to your OpenSearch domain

### 2. Clone the Repository

```bash
git clone https://github.com/Enterprise-CMCS/macpro-mako.git
cd macpro-mako
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies using npm (CloudShell default)
npm install

# If Bun is available and preferred
# bun install
```

### 4. Run the Export Script

```bash
# Basic export to S3 bucket (uses default key prefix: opensearch-exports/yyyy-mm-dd)
npx tsx scripts/export-index.ts --bucket your-s3-bucket-name --domain https://vpc-domain.us-east-1.es.amazonaws.com

# With custom options
npx tsx scripts/export-index.ts \
  --bucket your-s3-bucket-name \
  --domain https://vpc-domain.us-east-1.es.amazonaws.com \
  --key-prefix "opensearch-exports/2024-04-28" \
  --batch-size 2000
```

## Script Parameters

| Parameter      | Required | Description                    | Default                    |
| -------------- | -------- | ------------------------------ | -------------------------- |
| `--bucket`     | Yes      | S3 bucket name for export      | None                       |
| `--domain`     | Yes      | OpenSearch domain URL          | None                       |
| `--batch-size` | No       | Batch size for scrolling       | 1000 (main), 5000 (others) |
| `--key-prefix` | No       | S3 key prefix for files        | `opensearch-exports/yyyy-mm-dd` |
| `--help`       | No       | Show usage information         | -                          |

## Exported Indexes

The script exports these production indexes:

- `productionmain` - Package/submission records
- `productionchangelog` - Package activity/history
- `productiontypes` - SPA type reference data
- `productionsubtypes` - Subtype reference data
- `productioncpocs` - CPOC officer data
- `productioninsights` - Insights sink data
- `productionlegacyinsights` - Legacy insights sink data
- `productionusers` - User profile/user records
- `productionroles` - User role requests/status records

## Output Format

Each index is exported as a JSON file containing an array of document objects (just the `_source` data):

```json
[
  { "id": "123", "field1": "value1", ... },
  { "id": "456", "field2": "value2", ... },
  ...
]
```

S3 object metadata includes:

- `sourceIndex`: Original OpenSearch index name
- `exportedAt`: ISO timestamp of export
- `documentCount`: Number of documents in the file

## Example Usage

```bash
# Export with default key prefix (opensearch-exports/yyyy-mm-dd)
npx tsx scripts/export-index.ts \
  --bucket my-data-exports \
  --domain https://vpc-domain.us-east-1.es.amazonaws.com

# Export with custom organized S3 keys
npx tsx scripts/export-index.ts \
  --bucket my-data-exports \
  --domain https://vpc-domain.us-east-1.es.amazonaws.com \
  --key-prefix "custom-exports/2024/04/28"

# Default creates files like:
# s3://my-data-exports/opensearch-exports/2024-04-28/productionmain.json
# s3://my-data-exports/opensearch-exports/2024-04-28/productionchangelog.json
# etc.
```

## Troubleshooting

### Common Issues

1. **"OpenSearch domain URL is required"**
   - Make sure you provide the `--domain` parameter with the full HTTPS URL
   - Example: `--domain https://vpc-domain.us-east-1.es.amazonaws.com`

2. **Network connectivity errors**
   - Ensure CloudShell has VPC connectivity to your OpenSearch domain
   - Verify the domain endpoint URL is correct and accessible

3. **Permission errors**
   - Verify your CloudShell role has permissions to read from OpenSearch
   - Ensure S3 write permissions for the target bucket

4. **Module not found errors**
   - Run `npm install` to install dependencies
   - Verify you're in the correct directory (`macpro-mako`)

### Performance Notes

- The `main` index uses smaller batches (1000) as it's typically the largest
- Other indexes use larger batches (5000) for faster processing
- Adjust `--batch-size` if you encounter memory issues or timeouts
- Large exports may take significant time - the script shows progress updates

## Security Considerations

- The script uses CloudShell's automatic role-based authentication
- OpenSearch domain URL is passed as a parameter (not stored)
- No credentials are stored or logged
- S3 object metadata preserves audit trail information
- Consider bucket policies and access controls for exported data
