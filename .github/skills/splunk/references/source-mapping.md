
## Environments

- `prod`, `impl`, `dev` are the `cloudenv` values
- Use the `source` value exactly as shown in Splunk queries for corresponding cloud environments.
- Naming conventions
  - The cloudenv `prod` uses the word "production" in source `/aws/lambda/mako-production-api-createUserProfile`
  - The cloudenv `impl` uses the word "val" in source `/aws/lambda/mako-val-api-createUserProfile`
  - The cloudenv `dev` uses the git branch name, so it is not derivable like `prod` or `impl`

# Lambda Source Mapping

This file maps AWS Lambda CloudWatch log sources to the Splunk `source` names used in searches.

| Lambda Name | cloudenv | source |
|---|---|---|
| mako-val-api-attachmentArchiveBackfillStatus | impl | /aws/lambda/mako-val-api-attachmentArchiveBackfillStatus |
| mako-val-api-backfillAttachmentArchives | impl | /aws/lambda/mako-val-api-backfillAttachmentArchives |
| mako-val-api-getAttachmentArchive | impl | /aws/lambda/mako-val-api-getAttachmentArchive |
| mako-val-api-markAttachmentArchiveFailed | impl | /aws/lambda/mako-val-api-markAttachmentArchiveFailed |
| mako-val-api-notifyAttachmentArchiveIntegrity | impl | /aws/lambda/mako-val-api-notifyAttachmentArchiveIntegrity |
| mako-val-api-rebuildAttachmentArchives | impl | /aws/lambda/mako-val-api-rebuildAttachmentArchives |
| mako-val-api-runAttachmentArchiveIntegrityCheck | impl | /aws/lambda/mako-val-api-runAttachmentArchiveIntegrityCheck |
| mako-val-api-submitNOSO | impl | /aws/lambda/mako-val-api-submitNOSO |
| mako-val-api-submitSplitSPA | impl | /aws/lambda/mako-val-api-submitSplitSPA |
| mako-val-api-updatePackage | impl | /aws/lambda/mako-val-api-updatePackage |
| mako-val-api-validateAttachmentArchive | impl | /aws/lambda/mako-val-api-validateAttachmentArchive |
| mako-val-data-sinkChangelog | impl | /aws/lambda/mako-val-data-sinkChangelog |
| mako-val-data-sinkCpocs | impl | /aws/lambda/mako-val-data-sinkCpocs |
| mako-val-data-sinkMain | impl | /aws/lambda/mako-val-data-sinkMain |
| mako-val-data-sinkSubtypes | impl | /aws/lambda/mako-val-data-sinkSubtypes |
| mako-val-data-sinkTypes | impl | /aws/lambda/mako-val-data-sinkTypes |
| mako-val-email-processEmails | impl | /aws/lambda/mako-val-email-processEmails |
| mako-production-api-submitNOSO | prod | /aws/lambda/mako-production-api-submitNOSO |
| mako-production-api-submitSplitSPA | prod | /aws/lambda/mako-production-api-submitSplitSPA |
| mako-production-api-updatePackage | prod | /aws/lambda/mako-production-api-updatePackage |
| mako-production-data-sinkChangelog | prod | /aws/lambda/mako-production-data-sinkChangelog |
| mako-production-data-sinkCpocs | prod | /aws/lambda/mako-production-data-sinkCpocs |
| mako-production-data-sinkMain | prod | /aws/lambda/mako-production-data-sinkMain |
| mako-production-email-processEmails | prod | /aws/lambda/mako-production-email-processEmails |

## API Endpoint to Source Mapping

This table maps API Gateway endpoints to their backing Lambda handlers and Splunk sources.

| Method | Endpoint | URL Path | Lambda | source (dev) | source (impl) | source (prod) |
|---|---|---|---|---|---|---|
| GET | allForms | `/allForms` | `getAllForms` |  | /aws/lambda/mako-val-api-getAllForms | /aws/lambda/mako-production-api-getAllForms |
| GET | createUserProfile | `/createUserProfile` | `createUserProfile` | /aws/lambda/mako-datasink-api-createUserProfile | /aws/lambda/mako-val-api-createUserProfile | /aws/lambda/mako-production-api-createUserProfile |
| POST | forms | `/forms` | `getForm` |  | /aws/lambda/mako-val-api-forms | /aws/lambda/mako-production-api-forms |
| POST | getApprovers | `/getApprovers` | `getApprovers` | /aws/lambda/mako-datasink-api-getApprovers | /aws/lambda/mako-val-api-getApprovers | /aws/lambda/mako-production-api-getApprovers |
| POST | getAttachmentUrl | `/getAttachmentUrl` | `getAttachmentUrl` | /aws/lambda/mako-main-api-getAttachmentUrl | /aws/lambda/mako-val-api-getAttachmentUrl | /aws/lambda/mako-production-api-getAttachmentUrl |
| POST | getCpocs | `/getCpocs` | `getCpocs` |  | /aws/lambda/mako-val-api-getCpocs | /aws/lambda/mako-production-api-getCpocs |
| POST | getPackageActions | `/getPackageActions` | `getPackageActions` | /aws/lambda/mako-datasink-api-getPackageActions<br>/aws/lambda/mako-main-api-getPackageActions | /aws/lambda/mako-val-api-getPackageActions | /aws/lambda/mako-production-api-getPackageActions |
| GET | getRoleRequests | `/getRoleRequests` | `getRoleRequests` |  | /aws/lambda/mako-val-api-getRoleRequests | /aws/lambda/mako-production-api-getRoleRequests |
| POST | getSubTypes | `/getSubTypes` | `getSubTypes` |  | /aws/lambda/mako-val-api-getSubTypes | /aws/lambda/mako-production-api-getSubTypes |
| POST | getTypes | `/getTypes` | `getTypes` |  | /aws/lambda/mako-val-api-getTypes | /aws/lambda/mako-production-api-getTypes |
| POST | getUploadUrl | `/getUploadUrl` | `getUploadUrl` | /aws/lambda/mako-main-api-getUploadUrl | /aws/lambda/mako-val-api-getUploadUrl | /aws/lambda/mako-production-api-getUploadUrl |
| POST | getUserDetails | `/getUserDetails` | `getUserDetails` | /aws/lambda/mako-datasink-api-getUserDetails | /aws/lambda/mako-val-api-getUserDetails | /aws/lambda/mako-production-api-getUserDetails |
| POST | getUserProfile | `/getUserProfile` | `getUserProfile` | /aws/lambda/mako-datasink-api-getUserProfile | /aws/lambda/mako-val-api-getUserProfile | /aws/lambda/mako-production-api-getUserProfile |
| POST | item | `/item` | `item` | /aws/lambda/mako-datasink-api-item<br>/aws/lambda/mako-main-api-item | /aws/lambda/mako-val-api-item | /aws/lambda/mako-production-api-item |
| POST | itemExists | `/itemExists` | `itemExists` | /aws/lambda/mako-main-api-itemExists | /aws/lambda/mako-val-api-itemExists | /aws/lambda/mako-production-api-itemExists |
| GET | requestBaseCMSAccess | `/requestBaseCMSAccess` | `requestBaseCMSAccess` | /aws/lambda/mako-datasink-api-requestBaseCMSAccess | /aws/lambda/mako-val-api-requestBaseCMSAccess | /aws/lambda/mako-production-api-requestBaseCMSAccess |
| POST | search | `/search/{index}` | `search` | /aws/lambda/mako-datasink-api-search<br>/aws/lambda/mako-main-api-search | /aws/lambda/mako-val-api-search | /aws/lambda/mako-production-api-search |
| POST | submit | `/submit` | `submit` | /aws/lambda/mako-main-api-submit | /aws/lambda/mako-val-api-submit | /aws/lambda/mako-production-api-submit |
| POST | submitGroupDivision | `/submitGroupDivision` | `submitGroupDivision` |  | /aws/lambda/mako-val-api-submitGroupDivision | /aws/lambda/mako-production-api-submitGroupDivision |
| POST | submitRoleRequests | `/submitRoleRequests` | `submitRoleRequests` |  | /aws/lambda/mako-val-api-submitRoleRequests | /aws/lambda/mako-production-api-submitRoleRequests |
| GET | systemNotifs | `/systemNotifs` | `getSystemNotifs` | /aws/lambda/mako-datasink-api-getSystemNotifs<br>/aws/lambda/mako-main-api-getSystemNotifs | /aws/lambda/mako-val-api-getSystemNotifs | /aws/lambda/mako-production-api-getSystemNotifs |
| POST | updateUserRoles | `/updateUserRoles` | `updateUserRoles` |  | /aws/lambda/mako-val-api-updateUserRoles | /aws/lambda/mako-production-api-updateUserRoles |
