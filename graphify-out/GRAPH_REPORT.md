# Graph Report - macpro-mako  (2026-04-28)

## Corpus Check
- 1296 files · ~377,503 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2593 nodes · 2458 edges · 94 communities detected
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 643 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 130|Community 130]]

## God Nodes (most connected - your core abstractions)
1. `response()` - 29 edges
2. `getDomainAndNamespace()` - 26 edges
3. `search()` - 23 edges
4. `lookupUserAttributes()` - 23 edges
5. `itemExists()` - 22 edges
6. `main()` - 21 edges
7. `getAuthDetails()` - 21 edges
8. `isAuthorized()` - 21 edges
9. `getUserByEmail()` - 21 edges
10. `logError()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `packageDetailsLoader()` --calls--> `getItem()`  [INFERRED]
  react-app/src/features/package/index.tsx → lib/libs/opensearch-lib.ts
- `OneMAC Upgrade` --semantically_similar_to--> `Playwright Test Configuration`  [INFERRED] [semantically similar]
  README.md → test/README.md
- `StateRoleSignup()` --calls--> `isStateRole()`  [INFERRED]
  react-app/src/features/sign-up/stateRoleSignup.tsx → lib/packages/shared-utils/user-helper.ts
- `WithdrawWaiverRaiResponse()` --calls--> `response()`  [INFERRED]
  react-app/src/features/faq/faqs/waiver/withdraw-waiver-rai-response.tsx → lib/libs/handler-lib.ts
- `WithdrawSpaRaiResponse()` --calls--> `response()`  [INFERRED]
  react-app/src/features/faq/faqs/spa/withdraw-spa-rai-response.tsx → lib/libs/handler-lib.ts

## Hyperedges (group relationships)
- **OneMAC Submission Type Portfolio** — readme_medicaid_spa, readme_chip_eligibility_spa, readme_1915b_waiver, readme_1915c_appendix_k, readme_temporary_extension [EXTRACTED 1.00]
- **Playwright Test Project Matrix** — test_readme_project_local, test_readme_project_ci, test_readme_project_eua, test_readme_project_mfa [EXTRACTED 1.00]
- **OneMAC Frontend Presentation Layer** — index_html_onemac_app, index_html_main_tsx, main_mdx_storybook, index_html_google_analytics [INFERRED 0.80]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (59): AccessChangeNoticeEmail(), appK(), getAppkChildren(), ApproverInfo(), capitatedAmendment(), capitatedInitial(), capitatedRenewal(), getPackageChangelog() (+51 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (45): getAttachmentArchive(), getAttachmentUrl(), ErrorPage(), RoleStatusCard(), triggerGAEvent(), useGetLinks(), UserDropdownMenu(), userProfileLoader() (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (38): formatActionType(), formatActionTypeWithWaiver(), setup(), setup(), AppKCMSEmailPreview(), AppKStateEmailPreview(), setup(), setup() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (44): main(), checkIdentifierUsageHandler(), fetchAppkChildren(), setupHandler(), fetchChangelog(), setupHandler(), fetchPackage(), setupHandler() (+36 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (62): markAttachmentArchiveFailed(), getUpdatedAtMs(), resolveAttachmentArchiveCurrentState(), buildAllAttachmentsUnavailableArchiveFailure(), buildAttachmentArchiveBlockedAttachment(), buildAttachmentArchiveFailureMessage(), buildAttachmentNotCleanArchiveFailure(), getAttachmentArchiveFailureMessage() (+54 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (44): transformDeleteSchema(), transformUpdateValuesSchema(), decodeBase64WithUtf8(), isSkippableError(), SkippableValidationError, transform(), getDateStringOrNullFromEpoc(), getFinalDispositionDate() (+36 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (48): buildPackageAttachmentArchiveManifest(), buildSectionArchiveFolderName(), buildSectionAttachmentArchiveManifest(), formatEasternDownloadDate(), getArchiveArtifactKey(), getArchiveBasePrefix(), getArchiveCurrentKey(), getArchiveDownloadFilename() (+40 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (25): getFAQLinkForAttachments(), onAppend(), getForm(), getMaxVersion(), useDetailsSidebarLinks(), Amendment(), DetailsContent(), DetailsSidebar() (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (32): handler(), getAllStateUsersFromOpenSearch(), getEmailTemplates(), getLatestMatchingEvent(), getUserRoleTemplate(), hasAuthority(), hasEvent(), isEmailEvent() (+24 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (34): getAttachmentErrorInfo(), getAttachmentErrorMessage(), isAttachmentAccessDeniedError(), isAttachmentNotFoundError(), isLegacyAttachmentUnavailableError(), logAttachmentErrorClassification(), loadArchiveAttachment(), logSkippedAttachment() (+26 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (19): AccessPendingNoticeEmail(), AppKStateEmail(), ChipSpaStateEmail(), formatDate(), formatDateToET(), formatNinetyDaysDate(), isWithinDays(), handleActionClick() (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (24): triggerGAEvent(), useFilterDrawer(), useFilterState(), ChipTerms(), createLSColumns(), exportToCsv(), FilterChips(), handleExport() (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (32): parseAttachmentArchiveCurrent(), applyArchiveKeyPrefix(), buildClassificationCounts(), buildPackageRepairAudits(), getAccountId(), getNestedStackName(), getRebuildQueueUrl(), getScannerFunctionName() (+24 more)

### Community 13 - "Community 13"
Cohesion: 0.07
Nodes (19): handleInputChange(), banner(), BannerObserver, autoSubmit(), onCancel(), onSubmit(), delay(), handleCancel() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (28): isClientAllowedForObject(), badRequest(), defaultFilenameFromKey(), getClientIdFromAuthorizer(), getKnownErrorResponse(), getLatestChangelogTimestamp(), handleArchiveRequest(), handler() (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.1
Nodes (24): downloadAVDefinitions(), scanLocalFile(), updateAVDefinitonsWithFreshclam(), uploadAVDefinitions(), startClamd(), handler(), areMimeTypesEquivalent(), checkFileExt() (+16 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (10): generateAuthFile(), cognitoLogin(), createStorageState(), attachDashboardSetupDiagnostics(), catch(), globalSetup(), LoginPage, canBeRenewedOrAmended() (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (22): Api, buildApiTemplate(), createInlineLambda(), getArchiveBaseReadBucket(), getArchiveOverlayPrefix(), getEphemeralArchiveOverlayBucket(), isSharedArchiveStage(), resolveArchiveBaseReadStage() (+14 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (25): syncManifestToWriteBucket(), buildDiscrepancyEmailBody(), buildFailureEmailBody(), buildRawEmail(), chunkBase64(), createFailureSummary(), getEmailAddressLookupSecretName(), getIntegrityStageName() (+17 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (21): ensureNonEmptyString(), getActiveClient(), getExternalApiAuthConfig(), parseAllowedLocations(), parseBase64(), parseClient(), parseConfig(), parseHex() (+13 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (18): buildAttachmentArchiveCurrent(), isAllAttachmentsUnavailableArchive(), appendSectionManifest(), buildArchiveFromManifest(), buildCurrentFromManifest(), getCurrentArchiveStatus(), hasTransformToWebStream(), isAsyncIterableStream() (+10 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (8): getExport(), createUser(), setPassword(), DeploymentConfig, handler(), handler(), updateUserAttributes(), uploadToS3()

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (20): OneMAC Storybook Docs Entry, 1915(b) Waiver Submissions, 1915(c) Appendix K Waiver Submissions, CC0 1.0 Universal License, CHIP Eligibility SPA Submissions, CMS Review Workflows, CodeClimate Quality Gate, GitHub Wiki Documentation (+12 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (9): getValueAndMessage(), isDateObject(), isNullOrUndefined(), isObject(), isObjectType(), isRegex(), isString(), isUndefined() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.19
Nodes (13): getArchiveStorageConfig(), getCurrentStatus(), handler(), listArchiveCurrentKeys(), listNonReadyCurrentKeys(), removeArchiveKeyPrefix(), sampleItems(), getAttachmentArchiveBackfillPage() (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.21
Nodes (11): countBy(), filterCurrentKeys(), getAccountId(), getArchiveBucketName(), inspectCurrentEntries(), listArchiveCurrentKeys(), main(), parseArgs() (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (5): handler(), mockMediaQuery(), ResizeObserverMock, setupLayoutTest(), deleteTopics()

### Community 27 - "Community 27"
Cohesion: 0.23
Nodes (8): optionCrumbsFromPath(), actionCrumb(), dashboardCrumb(), detailsAndActionsCrumbs(), detailsCrumb(), getDashboardTabForAuthority(), getFormOrigin(), mapActionLabel()

### Community 28 - "Community 28"
Cohesion: 0.47
Nodes (10): additionalInfo(), createSectionId(), deliverySystemCharactaristics(), disenrollment(), generateDependency(), managedCare(), participationExclusions(), participationRequirements() (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.2
Nodes (5): MockAssumeRoleCommand, MockGetObjectCommand, MockHeadObjectCommand, MockS3Client, MockSTSClient

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (1): Storage

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (1): AddIssueFormSelectors

### Community 32 - "Community 32"
Cohesion: 0.64
Nodes (6): getResponse(), handleRequest(), resolveMainClient(), respondWithMock(), sendToClient(), serializeRequest()

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (3): handleSubmit(), useWebform(), WebformBody()

### Community 34 - "Community 34"
Cohesion: 0.46
Nodes (5): getDivisionDisplayValue(), getGroupDisplayValue(), parseNumericId(), resolveDivision(), resolveGroup()

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (3): CloudFrontWaf, RegionalWaf, WafConstruct

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (2): isStackDoesNotExistError(), stackExists()

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (2): handleLegacyAttachment(), s3ParseUrl()

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (2): checkTriggeringValue(), DependencyWrapperHandler()

### Community 43 - "Community 43"
Cohesion: 0.5
Nodes (2): AttachmentInstructions(), isZodArrayDef()

### Community 44 - "Community 44"
Cohesion: 0.6
Nodes (3): useGetData(), useGetSubTypes(), useGetTypes()

### Community 45 - "Community 45"
Cohesion: 0.4
Nodes (1): NavSelectors

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (2): ParentStack, sortSubnets()

### Community 47 - "Community 47"
Cohesion: 0.4
Nodes (1): MedSpaCMSEmail()

### Community 48 - "Community 48"
Cohesion: 0.7
Nodes (4): deleteCurrentObjects(), deleteVersionedObjects(), emptyBucket(), normalizePrefix()

### Community 49 - "Community 49"
Cohesion: 0.7
Nodes (4): countRunningExecutions(), getArchiveRebuildQueueUrl(), getArchiveStateMachineArn(), handler()

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (1): DataPoller

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (2): TestComponent(), useNavigationPrompt()

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (1): DashboardPage

### Community 58 - "Community 58"
Cohesion: 0.83
Nodes (3): writeEnvVarsToFile(), writeMockedUiEnvFile(), writeUiEnvFile()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (1): Data

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (1): Uploads

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (1): UiInfra

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (1): Networking

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (1): Auth

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (1): Alerts

### Community 65 - "Community 65"
Cohesion: 0.5
Nodes (1): WaiverCMSEmail()

### Community 66 - "Community 66"
Cohesion: 0.5
Nodes (1): transform()

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (1): transform()

### Community 69 - "Community 69"
Cohesion: 0.83
Nodes (3): getPackageActivityLabel(), getPackageActivityLabelSlug(), slugifyPackageActivityLabel()

### Community 70 - "Community 70"
Cohesion: 0.83
Nodes (3): checkAuthority(), checkStatus(), PackageCheck()

### Community 73 - "Community 73"
Cohesion: 0.5
Nodes (1): IamPermissionsBoundaryAspect

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (1): IamPathAspect

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (1): MockPointerEvent

### Community 82 - "Community 82"
Cohesion: 0.67
Nodes (1): Observer

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (2): convertStateAbbrToFullName(), isStringAState()

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (2): generateBoldAnswerJSX(), JSXModifyText()

### Community 100 - "Community 100"
Cohesion: 0.67
Nodes (1): FAQPage

### Community 102 - "Community 102"
Cohesion: 0.67
Nodes (1): Email

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (2): subsection(), subsectionFormFields()

### Community 104 - "Community 104"
Cohesion: 0.67
Nodes (1): EmailProcessingError

### Community 105 - "Community 105"
Cohesion: 0.67
Nodes (1): ChipSpaStateEmailPreview()

### Community 106 - "Community 106"
Cohesion: 0.67
Nodes (1): ChipSpaCMSEmailPreview()

### Community 107 - "Community 107"
Cohesion: 0.67
Nodes (1): ManageUsers

### Community 108 - "Community 108"
Cohesion: 0.67
Nodes (1): CloudWatchLogsResourcePolicy

### Community 109 - "Community 109"
Cohesion: 0.67
Nodes (1): CleanupKafka

### Community 110 - "Community 110"
Cohesion: 0.67
Nodes (1): EmptyBuckets

### Community 111 - "Community 111"
Cohesion: 0.67
Nodes (1): CloudWatchToS3

### Community 112 - "Community 112"
Cohesion: 0.67
Nodes (1): ClamScanScanner

### Community 114 - "Community 114"
Cohesion: 0.67
Nodes (1): CreateTopics

### Community 115 - "Community 115"
Cohesion: 0.67
Nodes (1): transform()

### Community 116 - "Community 116"
Cohesion: 0.67
Nodes (1): transform()

### Community 117 - "Community 117"
Cohesion: 0.67
Nodes (1): transform()

### Community 118 - "Community 118"
Cohesion: 0.67
Nodes (1): transform()

### Community 119 - "Community 119"
Cohesion: 0.67
Nodes (1): transform()

### Community 120 - "Community 120"
Cohesion: 0.67
Nodes (1): transform()

### Community 121 - "Community 121"
Cohesion: 0.67
Nodes (1): transform()

### Community 122 - "Community 122"
Cohesion: 0.67
Nodes (1): transform()

### Community 123 - "Community 123"
Cohesion: 0.67
Nodes (1): transform()

### Community 124 - "Community 124"
Cohesion: 0.67
Nodes (1): transform()

### Community 125 - "Community 125"
Cohesion: 0.67
Nodes (1): transform()

### Community 126 - "Community 126"
Cohesion: 0.67
Nodes (1): transform()

### Community 127 - "Community 127"
Cohesion: 0.67
Nodes (1): transform()

### Community 130 - "Community 130"
Cohesion: 1.0
Nodes (2): deleteAllTriggersForFunctions(), handler()

## Knowledge Gaps
- **17 isolated node(s):** `UserPromptObserver`, `BannerObserver`, `MockSTSClient`, `Medicaid SPA Submissions`, `CHIP Eligibility SPA Submissions` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 30`** (9 nodes): `Storage`, `.clear()`, `.constructor()`, `.getItem()`, `.key()`, `.length()`, `.removeItem()`, `.setItem()`, `mockStorage.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (9 nodes): `AddIssueFormSelectors`, `.addButton()`, `.constructor()`, `.descriptionInput()`, `.prioritySelect()`, `.submitButton()`, `.titleInput()`, `.typeSelect()`, `addIssueForm.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (6 nodes): `destroy.ts`, `deleteSecurityGroup()`, `isStackDoesNotExistError()`, `resolveDestroyTarget()`, `stackExists()`, `waitForStackDeleteComplete()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (6 nodes): `attachmentArraySchema()`, `attachmentArraySchemaOptional()`, `handleLegacyAttachment()`, `attachments.ts`, `s3-url-parser.ts`, `s3ParseUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (5 nodes): `checkTriggeringValue()`, `DependencyWrapper()`, `DependencyWrapperHandler()`, `triggerCheckSwitch()`, `dependencyWrapper.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (5 nodes): `AttachmentFAQInstructions()`, `AttachmentFileFormatInstructions()`, `AttachmentInstructions()`, `isZodArrayDef()`, `actionForm.components.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (5 nodes): `NavSelectors`, `.allIssuesLink()`, `.constructor()`, `.issuesDropDown()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (5 nodes): `parent.ts`, `getSubnetSize()`, `ParentStack`, `.constructor()`, `sortSubnets()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (5 nodes): `MedSpaCMS.tsx`, `MedSpaCMS.tsx`, `MedSpaCMS.tsx`, `MedSPACMS.tsx`, `MedSpaCMSEmail()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `DataPoller`, `.constructor()`, `.startPollingData()`, `DataPoller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `useNavigationPrompt.test.tsx`, `useNavigationPrompt.ts`, `TestComponent()`, `useNavigationPrompt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `DashboardPage`, `.constructor()`, `.validateDownload()`, `dashboard.page.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `Data`, `.constructor()`, `.initializeResources()`, `data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `uploads.ts`, `Uploads`, `.constructor()`, `.initializeResources()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `ui-infra.ts`, `UiInfra`, `.constructor()`, `.initializeResources()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `networking.ts`, `Networking`, `.constructor()`, `.initializeResources()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `Auth`, `.constructor()`, `.initializeResources()`, `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `Alerts`, `.constructor()`, `.initializeResources()`, `alerts.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (4 nodes): `WaiverCMS.tsx`, `WaiverCMS.tsx`, `WaiverCMS.tsx`, `WaiverCMSEmail()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (4 nodes): `temporary-extension.ts`, `temporary-extension.ts`, `temporary-extension.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (4 nodes): `transform()`, `app-k.ts`, `app-k.ts`, `app-k.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (4 nodes): `IamPermissionsBoundaryAspect`, `.constructor()`, `.visit()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (4 nodes): `IamPathAspect`, `.constructor()`, `.visit()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (3 nodes): `vitest.setup.ts`, `MockPointerEvent`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `Observer`, `.constructor()`, `basic-observable.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (3 nodes): `stateNames.ts`, `convertStateAbbrToFullName()`, `isStringAState()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (3 nodes): `generateBoldAnswerJSX()`, `JSXModifyText()`, `boldSearchResults.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (3 nodes): `FAQPage`, `.constructor()`, `faq.page.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `Email`, `.constructor()`, `email.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (3 nodes): `v202401.ts`, `subsection()`, `subsectionFormFields()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (3 nodes): `EmailProcessingError`, `.constructor()`, `errors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (3 nodes): `ChipSpaStateEmailPreview()`, `CHIP_SPA.tsx`, `CHIP_SPA.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (3 nodes): `ChipSpaCMSEmailPreview()`, `CHIP_SPA.tsx`, `CHIP_SPA.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (3 nodes): `ManageUsers`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (3 nodes): `CloudWatchLogsResourcePolicy`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (3 nodes): `CleanupKafka`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (3 nodes): `EmptyBuckets`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (3 nodes): `CloudWatchToS3`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (3 nodes): `ClamScanScanner`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (3 nodes): `CreateTopics`, `.constructor()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (3 nodes): `transform()`, `capitated-initial.ts`, `capitated-initial.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (3 nodes): `respond-to-rai.ts`, `respond-to-rai.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (3 nodes): `transform()`, `capitated-amendment.ts`, `capitated-amendment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (3 nodes): `transform()`, `contracting-initial.ts`, `contracting-initial.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (3 nodes): `new-chip-details-submission.ts`, `new-chip-details-submission.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (3 nodes): `transform()`, `contracting-amendment.ts`, `contracting-amendment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (3 nodes): `transform()`, `contracting-renewal.ts`, `contracting-renewal.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (3 nodes): `upload-subsequent-documents.ts`, `upload-subsequent-documents.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (3 nodes): `new-chip-submission.ts`, `new-chip-submission.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 124`** (3 nodes): `new-medicaid-submission.ts`, `new-medicaid-submission.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (3 nodes): `toggle-withdraw-rai.ts`, `toggle-withdraw-rai.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (3 nodes): `withdraw-package.ts`, `withdraw-package.ts`, `transform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (3 nodes): `transform()`, `capitated-renewal.ts`, `capitated-renewal.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (3 nodes): `deleteAllTriggersForFunctions()`, `handler()`, `deleteTriggers.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `processRecord()` connect `Community 8` to `Community 0`, `Community 10`, `Community 5`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `getPackageChangelog()` connect `Community 0` to `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 14`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `getItem()` connect `Community 8` to `Community 0`, `Community 3`, `Community 7`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `response()` (e.g. with `WithdrawWaiverRaiResponse()` and `WithdrawSpaRaiResponse()`) actually correct?**
  _`response()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `getDomainAndNamespace()` (e.g. with `getItems()` and `bulkUpdateDataWrapper()`) actually correct?**
  _`getDomainAndNamespace()` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `search()` (e.g. with `checkIdentifierUsage()` and `getPackageChangelog()`) actually correct?**
  _`search()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `lookupUserAttributes()` (e.g. with `getPackageActions()` and `capitatedInitial()`) actually correct?**
  _`lookupUserAttributes()` has 17 INFERRED edges - model-reasoned connections that need verification._