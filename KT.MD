# OneMAC Knowledge Transfer Documentation

## Executive Summary

OneMAC is a comprehensive state government application that enables state employees to submit new Medicaid waivers, State Plan Amendments (SPAs), and amendments to existing programs. The application serves as a modernized replacement for the legacy OneMAC system, providing a streamlined interface for complex healthcare policy submissions while maintaining integration with existing CMS systems.

**Important Note**: CMS users do not directly use the OneMAC application. Instead, CMS users work in **SEATool**, which updates the SEATool database. These changes are captured by BigMAC Kafka topics and consumed by OneMAC's processing layer for data synchronization.

### Key Capabilities

- **New Submissions**: Medicaid SPAs, CHIP SPAs, 1915(b) Waivers, 1915(c) Appendix K Amendments, Temporary Extensions *[Source: `react-app/src/features/forms/new-submission/`, `lib/packages/shared-types/events/`]*
- **Package Management**: Respond to RAI (Request for Additional Information), withdraw packages, upload subsequent documents *[Source: `react-app/src/features/forms/post-submission/`]*
- **User Management**: Role-based access control with state-specific permissions *[Source: `react-app/src/features/user-roles/`, `lib/lambda/user-management/`]*
- **Real-time Data Sync**: Integration with SEATool and legacy OneMAC systems via Kafka event streaming *[Source: `lib/lambda/sinkMain.ts`, `lib/lambda/sinkMainProcessors.ts`]*

## High-Level Architecture Overview

```mermaid
graph TB
    subgraph "External Systems"
        SEATool[SEATool Database]
        OneMAC[Legacy OneMAC]
        IDM[Identity Management]
    end
    
    subgraph "Data Ingestion Layer"
        Kafka[Kafka Event Streams]
        Debezium[Debezium CDC]
    end
    
    subgraph "CMS Systems"
        SEATool[SEATool Application<br/>Used by CMS Users]
        SEAToolDB[SEATool Database]
        BigMAC[BigMAC Kafka Topics]
    end
    
    subgraph "AWS Infrastructure"
        subgraph "Processing Layer"
            SinkMain[Sink Main Lambda]
            SinkEmail[Email Processing Lambda]
            SinkTypes[Types/Subtypes Lambda]
            SinkCpocs[CPOCs Lambda]
        end
        
        subgraph "Data Layer"
            OpenSearch[OpenSearch Domain]
            S3[S3 Attachments Bucket]
        end
        
        subgraph "API Layer"
            APIGateway[API Gateway]
            SearchAPI[Search Lambda]
            SubmitAPI[Submit Lambda]
            UserMgmt[User Management Lambda]
        end
        
        subgraph "Frontend"
            CloudFront[CloudFront Distribution]
            ReactApp[React SPA]
        end
    end
    
    subgraph "Users"
        StateUsers[State Government Users]
        CMSUsers[CMS Users<br/>Use SEATool, not OneMAC]
    end
    
    SEATool --> Debezium
    OneMAC --> Kafka
    Debezium --> Kafka
    
    CMSUsers --> SEATool
    SEATool --> SEAToolDB
    SEAToolDB --> BigMAC
    BigMAC --> Kafka
    
    Kafka --> SinkMain
    Kafka --> SinkEmail
    Kafka --> SinkTypes
    Kafka --> SinkCpocs
    
    SinkMain --> OpenSearch
    SinkEmail --> SES[Amazon SES]
    SinkTypes --> OpenSearch
    SinkCpocs --> OpenSearch
    
    ReactApp --> APIGateway
    APIGateway --> SearchAPI
    APIGateway --> SubmitAPI
    APIGateway --> UserMgmt
    
    SearchAPI --> OpenSearch
    SubmitAPI --> S3
    SubmitAPI --> Kafka
    
    CloudFront --> ReactApp
    StateUsers --> CloudFront
    
    IDM --> ReactApp
    
    SES --> StateUsers
    SES --> CMSUsers
```

## Technical Architecture

### Core Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS *[Source: `react-app/package.json`, `react-app/vite.config.ts`]*
- **Backend**: AWS Lambda + Node.js + TypeScript *[Source: `lib/lambda/`, `lib/stacks/api.ts`]*
- **Data Storage**: OpenSearch + S3 *[Source: `lib/stacks/data.ts`, `lib/stacks/uploads.ts`]*
- **Event Streaming**: Apache Kafka + Debezium CDC *[Source: `lib/lambda/sinkMain.ts`, `.github/workflows/deploy.yml`]*
- **Infrastructure**: AWS CDK + CloudFormation *[Source: `lib/stacks/`, `cdk.json`]*
- **Authentication**: AWS Cognito + IDM Integration *[Source: `lib/stacks/auth.ts`, `lib/stacks/data.ts`]*
- **Testing**: Vitest + Playwright + Storybook *[Source: `test/playwright.config.ts`, `react-app/vitest.storybook.config.ts`]*
- **CI/CD**: GitHub Actions + Semantic Release *[Source: `.github/workflows/`, `package.json`]*

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User as State User
    participant UI as OneMAC Frontend
    participant API as API Gateway
    participant Submit as Submit Lambda
    participant Kafka as Kafka Stream
    participant Sink as Sink Lambdas
    participant OS as OpenSearch
    participant Email as Email Lambda
    participant SEATool as SEATool (CMS Users)
    participant CMS as CMS Users
    
    User->>UI: Submit Waiver/SPA
    UI->>API: POST /submit
    API->>Submit: Process submission
    Submit->>S3: Store attachments
    Submit->>Kafka: Publish event
    Submit->>UI: Return success
    UI->>User: Show confirmation
    
    Kafka->>Sink: Consume events
    Sink->>OS: Index documents
    Sink->>Email: Trigger notifications
    Email->>CMS: Send notification email
    Email->>User: Send confirmation email
    
    CMS->>SEATool: Review submission in SEATool
    SEATool->>Kafka: Status updates via BigMAC topics
    Kafka->>Sink: Process status changes
    Sink->>OS: Update package status
    Sink->>Email: Trigger status change emails
    Email->>User: Notify of status changes
    
    Note over Kafka,Sink: Multiple sink lambdas process<br/>different event types in parallel
```

## Data Processing Pipeline

### 1. Event Ingestion (`sinkMain.ts`)

The main data processing pipeline handles three primary Kafka topics *[Source: `lib/lambda/sinkMain.ts` lines 24-31]*:

- **`aws.onemac.migration.cdc`**: New submissions from the OneMAC UI
- **`aws.seatool.ksql.onemac.three.agg.State_Plan`**: SEATool state plan updates (via BigMAC)
- **`aws.seatool.debezium.changed_date.SEA.dbo.State_Plan`**: Date synchronization from SEATool

```mermaid
graph LR
    subgraph "Kafka Topics"
        OneMacCDC[aws.onemac.migration.cdc]
        SeatoolAgg[aws.seatool.ksql.onemac.three.agg.State_Plan]
        SeatoolDates[aws.seatool.debezium.changed_date.SEA.dbo.State_Plan]
    end
    
    subgraph "Processing Functions"
        InsertOneMac[insertOneMacRecordsFromKafkaIntoOneMAC]
        InsertSeatool[insertNewSeatoolRecordsFromKafkaIntoOneMAC]
        SyncDates[syncSeatoolRecordDatesFromKafkaWithOneMAC]
    end
    
    subgraph "OpenSearch Indices"
        MainIndex[main]
        UsersIndex[users]
        RolesIndex[roles]
    end
    
    OneMacCDC --> InsertOneMac
    SeatoolAgg --> InsertSeatool
    SeatoolDates --> SyncDates
    
    InsertOneMac --> MainIndex
    InsertOneMac --> UsersIndex
    InsertOneMac --> RolesIndex
    InsertSeatool --> MainIndex
    SyncDates --> MainIndex
```

### 2. Data Transformation (`sinkMainProcessors.ts`)

The system handles multiple record types with sophisticated validation and transformation *[Source: `lib/lambda/sinkMainProcessors.ts` lines 121-258]*:

- **OneMAC Records**: New submissions from the current application *[Source: `lib/lambda/sinkMainProcessors.ts` lines 121-127]*
- **Legacy OneMAC Records**: Historical data from the previous system *[Source: `lib/lambda/sinkMainProcessors.ts` lines 107-119]*
- **SEATool Records**: External system data requiring status reconciliation *[Source: `lib/lambda/sinkMainProcessors.ts` lines 442-571]*
- **SEATool Records**: Status updates and review actions from CMS users via BigMAC topics
- **User Records**: Role requests and user information *[Source: `lib/lambda/sinkMainProcessors.ts` lines 61-106]*
- **Admin Changes**: Administrative modifications to existing records *[Source: `lib/lambda/sinkMainProcessors.ts` lines 129-135]*

### 3. Status Reconciliation

A critical feature is the `oneMacSeatoolStatusCheck` function that reconciles status conflicts between OneMAC and SEATool systems *[Source: `lib/lambda/sinkMainProcessors.ts` lines 340-435]*:

- **Withdrawal Requested**: OneMAC takes precedence until SEATool confirms withdrawal *[Source: lines 347-354]*
- **RAI Responses**: Timestamp-based logic determines if responses were submitted before new RAI requests *[Source: lines 375-399]*
- **Status Priority**: OneMAC statuses for withdrawal and RAI responses override SEATool statuses *[Source: lines 411-431]*
- **SEATool Integration**: Status updates from CMS users in SEATool flow through BigMAC topics

## OpenSearch Architecture

### Index Structure

The application maintains multiple OpenSearch indices *[Source: `lib/lambda/setupIndex.ts` lines 13-54]*:

```mermaid
graph TB
    subgraph "OpenSearch Domain"
        Main[main index<br/>- State plans<br/>- Waivers<br/>- Submissions]
        Changelog[changelog index<br/>- Event history<br/>- Status changes]
        Types[types index<br/>- SPA types<br/>- Authority types]
        Subtypes[subtypes index<br/>- Type categories]
        CPOCs[cpocs index<br/>- Contact persons]
        Insights[insights index<br/>- Analytics data]
        LegacyInsights[legacyinsights index<br/>- Historical analytics]
        Users[users index<br/>- User information]
        Roles[roles index<br/>- Role requests]
    end
    
    subgraph "Data Sources"
        OneMAC_UI[OneMAC UI Submissions]
        SeatoolData[SEATool Database]
        LegacyData[Legacy OneMAC]
        SEAToolData[SEATool via BigMAC]
    end
    
    OneMAC_UI --> Main
    OneMAC_UI --> Changelog
    OneMAC_UI --> Users
    OneMAC_UI --> Roles
    
    SeatoolData --> Main
    SeatoolData --> Types
    SeatoolData --> Subtypes
    SeatoolData --> CPOCs
    SeatoolData --> Insights
    
    SEAToolData --> Main
    SEAToolData --> Changelog
    
    LegacyData --> Main
    LegacyData --> Changelog
    LegacyData --> LegacyInsights
    LegacyData --> Users
    LegacyData --> Roles
```

### Search Functionality (`search.ts`)

The search API provides filtered access based on user permissions *[Source: `lib/lambda/search.ts`]*:

- **State Filtering**: Users only see records for their authorized states *[Source: lines 39-42]*
- **Origin Filtering**: Returns OneMAC records and NOSO events from SEATool *[Source: lines 44-58]*
- **Soft Delete Handling**: Excludes deleted records *[Source: line 37]*
- **AppK Children**: Automatically fetches related Appendix K child records *[Source: lines 63-70]*

## Frontend Architecture

### React Application Structure

```mermaid
graph TB
    subgraph "React Application"
        subgraph "Core Features"
            Dashboard[Dashboard<br/>- Package listings<br/>- Status overview]
            Forms[Form System<br/>- Dynamic validation<br/>- File uploads]
            PackageDetails[Package Details<br/>- Status tracking<br/>- Action buttons]
            UserMgmt[User Management<br/>- Role requests<br/>- Access control]
        end
        
        subgraph "Form Types"
            NewSubmissions[New Submissions<br/>- Medicaid SPA<br/>- CHIP SPA<br/>- 1915b Waivers<br/>- 1915c App-K]
            PostSubmissions[Post-Submission Actions<br/>- Respond to RAI<br/>- Withdraw packages<br/>- Upload documents]
        end
        
        subgraph "Supporting Features"
            Analytics[Google Analytics<br/>- Page tracking<br/>- User behavior]
            A11y[508 Compliance<br/>- WCAG standards<br/>- Screen reader support]
            ErrorHandling[Error Handling<br/>- User feedback<br/>- Logging]
        end
    end
    
    Dashboard --> PackageDetails
    Forms --> NewSubmissions
    Forms --> PostSubmissions
    PackageDetails --> PostSubmissions
```

### Form System

The application uses a sophisticated form system with *[Source: `react-app/src/features/forms/`, `react-app/src/formSchemas/`]*:

- **Dynamic Schema Validation**: Zod schemas for type-safe validation *[Source: `react-app/src/formSchemas/`]*
- **Conditional Fields**: Fields that appear/disappear based on selections *[Source: `react-app/src/features/forms/new-submission/`]*
- **File Upload Management**: Secure S3 uploads with virus scanning *[Source: `lib/local-constructs/clamav-scanning/`]*
- **Real-time Validation**: Client-side and server-side validation *[Source: `react-app/src/components/ActionForm/`]*
- **Accessibility**: Full 508 compliance with screen reader support *[Source: `react-app/.storybook/preview.tsx` lines 39-42]*

## Email Notification System

### Email Templates and Triggers

```mermaid
graph TB
    subgraph "Email Triggers"
        NewSub[New Submission]
        StatusChange[Status Change]
        RAIRequest[RAI Request]
        UserRole[User Role Change]
    end
    
    subgraph "Email Types"
        CMSEmails[CMS Notifications<br/>- New submissions<br/>- Status updates]
        StateEmails[State Confirmations<br/>- Submission receipts<br/>- Action confirmations]
        UserEmails[User Management<br/>- Role approvals<br/>- Access changes]
    end
    
    subgraph "Delivery"
        SES[Amazon SES]
        Recipients[Email Recipients]
    end
    
    NewSub --> CMSEmails
    NewSub --> StateEmails
    StatusChange --> CMSEmails
    StatusChange --> StateEmails
    RAIRequest --> StateEmails
    UserRole --> UserEmails
    
    CMSEmails --> SES
    StateEmails --> SES
    UserEmails --> SES
    
    SES --> Recipients
```

### Email Content Management

- **React Email Templates**: Type-safe email templates using React components *[Source: `lib/libs/email/content/`, `lib/libs/email/preview/`]*
- **Authority-Specific Content**: Different templates for different waiver/SPA types *[Source: `lib/libs/email/index.ts` lines 48-69]*
- **Dynamic Content**: Variables populated from submission data *[Source: `lib/libs/email/content/newSubmission/index.tsx`]*
- **Attachment Listings**: Automatic inclusion of uploaded documents *[Source: email template files in `lib/libs/email/preview/`]*

## Legacy System Integration

### OneMAC Migration Strategy

```mermaid
graph LR
    subgraph "Legacy OneMAC"
        LegacyDB[(OneMAC Database)]
        LegacyUI[OneMAC Interface]
    end
    
    subgraph "Migration Layer"
        CDC[Change Data Capture]
        Transform[Data Transformation]
        Validation[Schema Validation]
    end
    
    subgraph "OneMAC System"
        KafkaStream[Kafka Stream]
        OneMAC_OS[OpenSearch]
        OneMAC_UI[OneMAC Interface]
    end
    
    LegacyDB --> CDC
    CDC --> Transform
    Transform --> Validation
    Validation --> KafkaStream
    KafkaStream --> OneMAC_OS
    OneMAC_OS --> OneMAC_UI
    
    LegacyUI -.->|"Read-only<br/>Historical Access"| OneMAC_UI
```

### SEATool Integration

SEATool provides authoritative data for *[Source: `lib/lambda/sinkTypes.ts`, `lib/lambda/sinkSubtypes.ts`, `lib/lambda/sinkCpocs.ts`]*:

- **State Plan Types**: Available submission types per state *[Source: `lib/lambda/getTypes.ts`, `lib/lambda/sinkTypes.ts`]*
- **Contact Information**: State and CMS contact persons (CPOCs) *[Source: `lib/lambda/getCpocs.ts`, `lib/lambda/sinkCpocs.ts`]*
- **Status Updates**: Official CMS review statuses *[Source: `lib/lambda/sinkMainProcessors.ts` lines 340-435]*
- **Reference Data**: Authorities, types, and subtypes *[Source: `lib/lambda/getSubTypes.ts`, `lib/lambda/sinkSubtypes.ts`]*

## Testing Strategy

### Multi-Layered Testing Approach

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E[End-to-End Tests<br/>Playwright<br/>- User workflows<br/>- Cross-browser testing<br/>- Authentication flows]
        Integration[Integration Tests<br/>Vitest<br/>- API endpoints<br/>- Database operations<br/>- Email sending]
        Unit[Unit Tests<br/>Vitest<br/>- Component logic<br/>- Utility functions<br/>- Form validation]
        A11y[Accessibility Tests<br/>Storybook + axe-core<br/>- 508 compliance<br/>- WCAG standards<br/>- Screen reader support]
    end
    
    Unit --> Integration
    Integration --> E2E
    A11y --> E2E
```

### 508 Accessibility Compliance

The application ensures full accessibility compliance through *[Source: `react-app/.storybook/`, `.github/workflows/a11y.yml`]*:

- **Automated Testing**: Storybook integration with axe-core for automated accessibility testing *[Source: `react-app/.storybook/vitest.setup.ts`, `react-app/vitest.storybook.config.ts`]*
- **Manual Testing**: Screen reader compatibility testing *[Source: `test/` Playwright tests]*
- **WCAG 2.1 AA Standards**: Full compliance with federal accessibility requirements *[Source: `react-app/.storybook/preview.tsx` lines 39-42]*
- **Continuous Monitoring**: Accessibility tests run on every build *[Source: `.github/workflows/a11y.yml`]*

### Test Environments

- **Local**: Development environment with mocked services *[Source: `test/playwright.config.ts` lines 100-106]*
- **CI**: Automated testing environment for pull requests *[Source: `test/playwright.config.ts` lines 108-114]*
- **Val**: Validation environment for pre-production testing *[Source: `test/playwright.config.ts` lines 116-122]*
- **Production**: Smoke tests on live environment *[Source: `test/playwright.config.ts` lines 140-146, `test/e2e/smoke/`]*

## CI/CD Pipeline

### GitHub Actions Workflow

```mermaid
graph TB
    subgraph "Development Workflow"
        PR[Pull Request]
        Lint[Linting & Formatting]
        Test[Unit & Integration Tests]
        Build[Build Application]
        A11y[Accessibility Tests]
    end
    
    subgraph "Deployment Pipeline"
        Deploy[Deploy to AWS]
        E2E[End-to-End Tests]
        Security[Security Scanning<br/>- CFN Nag<br/>- Dependency Check]
        Release[Semantic Release]
    end
    
    subgraph "Monitoring"
        Alerts[CloudWatch Alerts]
        Reports[Test Reports<br/>GitHub Pages]
    end
    
    PR --> Lint
    Lint --> Test
    Test --> Build
    Build --> A11y
    A11y --> Deploy
    Deploy --> E2E
    Deploy --> Security
    Security --> Release
    
    E2E --> Reports
    Deploy --> Alerts
```

### Deployment Strategy

- **Branch-based Deployments**: Each branch gets its own AWS environment *[Source: `.github/workflows/deploy.yml` lines 9-14]*
- **Infrastructure as Code**: Full AWS infrastructure defined in CDK *[Source: `lib/stacks/`, `cdk.json`]*
- **Automated Testing**: Comprehensive test suite runs on every deployment *[Source: `.github/workflows/deploy.yml` lines 113-181]*
- **Security Scanning**: CloudFormation templates scanned for security issues *[Source: `.github/workflows/deploy.yml` lines 196-226]*

## User Roles and Permissions

### Role-Based Access Control

```mermaid
graph TB
    subgraph "User Roles"
        StateSubmitter[State Submitter<br/>- Submit new packages<br/>- Respond to RAI<br/>- Upload documents]
        StateSystemAdmin[State System Admin<br/>- Manage state users<br/>- All state submitter permissions]
        CMSReviewer[CMS Reviewer<br/>- Review submissions<br/>- Request additional info]
        CMSRoleApprover[CMS Role Approver<br/>- Approve user roles<br/>- Manage access]
        Helpdesk[Helpdesk<br/>- User support<br/>- Limited admin functions]
    end
    
    subgraph "Permissions"
        StateAccess[State-Specific Access<br/>- Users limited to their states<br/>- Territory-based filtering]
        ActionPermissions[Action Permissions<br/>- Submit/withdraw packages<br/>- Respond to requests<br/>- Administrative functions]
    end
    
    StateSubmitter --> StateAccess
    StateSystemAdmin --> StateAccess
    StateSubmitter --> ActionPermissions
    StateSystemAdmin --> ActionPermissions
    CMSReviewer --> ActionPermissions
    CMSRoleApprover --> ActionPermissions
    Helpdesk --> ActionPermissions
```

## Package Lifecycle

### Submission to Approval Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: User starts submission
    Draft --> Submitted: Submit to CMS
    Submitted --> UnderReview: CMS begins review
    
    UnderReview --> PendingRAI: CMS requests additional info
    UnderReview --> Approved: CMS approves
    UnderReview --> Disapproved: CMS disapproves
    
    PendingRAI --> RAIResponse: State responds
    RAIResponse --> UnderReview: CMS reviews response
    
    Submitted --> WithdrawRequested: State requests withdrawal
    PendingRAI --> RAIWithdrawRequested: State requests RAI withdrawal
    
    WithdrawRequested --> Withdrawn: CMS approves withdrawal
    RAIWithdrawRequested --> PendingRAI: CMS denies withdrawal
    RAIWithdrawRequested --> Withdrawn: CMS approves withdrawal
    
    Approved --> [*]
    Disapproved --> [*]
    Withdrawn --> [*]
```

### Package Types and Authorities

The system supports multiple submission types *[Source: `react-app/src/features/forms/`, `lib/packages/shared-types/events/`]*:

#### State Plan Amendments (SPAs)

- **Medicaid SPA**: Standard Medicaid state plan amendments *[Source: `react-app/src/features/forms/new-submission/Medicaid.tsx`]*
- **CHIP SPA**: Children's Health Insurance Program amendments *[Source: `react-app/src/features/forms/new-submission/Chip.tsx`]*
- **CHIP Eligibility SPA**: CHIP eligibility-specific amendments *[Source: `react-app/src/features/forms/new-submission/ChipDetails.tsx`]*

#### Waivers

- **1915(b) Comprehensive Capitated**: Managed care waivers *[Source: `react-app/src/features/forms/waiver/capitated/`]*
- **1915(b) Comprehensive Contracting**: Fee-for-service selective contracting *[Source: `react-app/src/features/forms/waiver/contracting/`]*
- **1915(c) Appendix K**: Home and community-based services amendments *[Source: `react-app/src/features/forms/waiver/app-k/`]*
- **Temporary Extensions**: Short-term waiver extensions *[Source: `react-app/src/features/forms/waiver/temporary-extension/`]*

## Google Analytics Integration

### User Behavior Tracking

The application implements comprehensive analytics through `PathTracker.tsx` *[Source: `react-app/src/utils/ReactGA/PathTracker.tsx`]*:

```mermaid
graph TB
    subgraph "Analytics Events"
        PageView[Page View Events<br/>- Route changes<br/>- User role context<br/>- Referrer tracking]
        PageDuration[Page Duration Events<br/>- Time spent on page<br/>- User engagement metrics]
        FormSubmission[Form Submission Events<br/>- Submission type tracking<br/>- Completion rates]
    end
    
    subgraph "Data Collection"
        GTM[Google Tag Manager]
        GA4[Google Analytics 4]
    end
    
    subgraph "Insights"
        UserJourney[User Journey Analysis]
        FormPerformance[Form Performance Metrics]
        RoleBasedUsage[Role-Based Usage Patterns]
    end
    
    PageView --> GTM
    PageDuration --> GTM
    FormSubmission --> GTM
    
    GTM --> GA4
    
    GA4 --> UserJourney
    GA4 --> FormPerformance
    GA4 --> RoleBasedUsage
```

### Analytics Implementation

- **Automatic Page Tracking**: Route changes automatically tracked *[Source: `react-app/src/utils/ReactGA/PathTracker.tsx` lines 52-70]*
- **User Role Context**: All events include user role information *[Source: `react-app/src/utils/ReactGA/PathTracker.tsx` lines 27-31, 40-44]*
- **Form-Specific Tracking**: Different submission types tracked separately *[Source: `react-app/src/utils/ReactGA/Mapper.tsx`]*
- **Performance Monitoring**: Page load times and user engagement metrics *[Source: `react-app/src/utils/ReactGA/PathTracker.tsx` lines 35-46]*

## Development Workflow

### Local Development Setup

1. **Prerequisites**: Node.js, Bun, direnv, AWS CLI *[Source: `run` script lines 8-30]*
2. **Environment Setup**: `.envrc` file with AWS credentials and environment variables *[Source: project memory about direnv usage]*
3. **Database Setup**: Local OpenSearch instance or connection to shared environment *[Source: `lib/stacks/data.ts`]*
4. **Service Dependencies**: Kafka topics and external service mocks *[Source: `mocks/` directory]*

### Development Commands

```bash
# Install dependencies
run install

# Start local development
run ui

# Run tests
run test

# Run end-to-end tests
run e2e

# Deploy to AWS
run deploy --stage <branch-name>

# View logs
run logs

# Open application
run open-app

# View Kibana dashboard
run open-kibana
```

*[Source: `bin/cli/src/run.ts`, `bin/cli/src/commands/`]*

## Monitoring and Observability

### CloudWatch Integration

```mermaid
graph TB
    subgraph "Monitoring Stack"
        subgraph "Metrics"
            LambdaMetrics[Lambda Metrics<br/>- Execution duration<br/>- Error rates<br/>- Invocation counts]
            OSMetrics[OpenSearch Metrics<br/>- Query performance<br/>- Index health<br/>- Storage usage]
            KafkaMetrics[Kafka Metrics<br/>- Consumer lag<br/>- Message throughput<br/>- Topic health]
        end
        
        subgraph "Logging"
            LambdaLogs[Lambda Logs]
            APILogs[API Gateway Logs]
            ErrorLogs[Error Tracking]
        end
        
        subgraph "Alerting"
            SNSAlerts[SNS Notifications]
            EmailAlerts[Email Alerts]
            SlackIntegration[Slack Integration]
        end
    end
    
    LambdaMetrics --> SNSAlerts
    OSMetrics --> SNSAlerts
    KafkaMetrics --> SNSAlerts
    ErrorLogs --> SNSAlerts
    
    SNSAlerts --> EmailAlerts
    SNSAlerts --> SlackIntegration
```

### Error Handling Strategy

- **Structured Logging**: Consistent error logging with context *[Source: `lib/libs/sink-lib.ts`, `lib/lambda/sinkMainProcessors.ts` error handling]*
- **Dead Letter Queues**: Failed Kafka messages routed to DLQ for investigation *[Source: `lib/stacks/email.ts` lines 247-252]*
- **Graceful Degradation**: Application continues functioning during partial failures *[Source: `lib/lambda/sinkMainProcessors.ts` validation and error handling]*
- **Automatic Retries**: Built-in retry logic for transient failures *[Source: Lambda function configurations in `lib/stacks/`]*

## Security Architecture

### Authentication and Authorization

```mermaid
graph TB
    subgraph "Authentication Flow"
        User[User]
        Cognito[AWS Cognito]
        IDM[Identity Management]
        JWT[JWT Tokens]
    end
    
    subgraph "Authorization"
        RoleCheck[Role Validation]
        StateCheck[State Access Check]
        ActionCheck[Action Permission Check]
    end
    
    subgraph "API Security"
        APIGateway[API Gateway<br/>JWT Validation]
        Lambda[Lambda Functions<br/>Role-based logic]
    end
    
    User --> IDM
    IDM --> Cognito
    Cognito --> JWT
    JWT --> APIGateway
    
    APIGateway --> RoleCheck
    RoleCheck --> StateCheck
    StateCheck --> ActionCheck
    ActionCheck --> Lambda
```

### Data Security

- **Encryption at Rest**: All data encrypted in OpenSearch and S3 *[Source: `lib/stacks/data.ts` lines 178-183, `lib/stacks/uploads.ts`]*
- **Encryption in Transit**: TLS 1.2+ for all communications *[Source: `lib/stacks/data.ts` lines 180-183]*
- **VPC Isolation**: Lambda functions run in private subnets *[Source: `lib/stacks/api.ts`, `lib/stacks/data.ts` VPC configurations]*
- **IAM Least Privilege**: Minimal required permissions for each service *[Source: `lib/stacks/api.ts` IAM role definitions]*
- **Virus Scanning**: All uploaded files scanned before storage *[Source: `lib/local-constructs/clamav-scanning/`]*

## Performance Considerations

### Optimization Strategies

1. **Parallel Processing**: Kafka events processed in parallel across multiple Lambda functions *[Source: `lib/lambda/sinkMain.ts` lines 17-38]*
2. **Batch Operations**: Bulk updates to OpenSearch for efficiency *[Source: `lib/libs/sink-lib.ts` bulkUpdateDataWrapper]*
3. **Caching**: CloudFront caching for static assets *[Source: `lib/stacks/ui-infra.ts`]*
4. **Connection Pooling**: Reused connections to OpenSearch *[Source: `lib/libs/opensearch-lib.ts`]*
5. **Lazy Loading**: Frontend components loaded on demand *[Source: `react-app/src/` component structure]*

### Scalability Features

- **Auto-scaling Lambda**: Functions scale automatically with load *[Source: AWS Lambda default behavior, `lib/stacks/api.ts` Lambda configurations]*
- **OpenSearch Scaling**: Multi-AZ deployment with auto-scaling *[Source: `lib/stacks/data.ts` lines 171-177]*
- **CDN Distribution**: Global content delivery via CloudFront *[Source: `lib/stacks/ui-infra.ts`]*
- **Kafka Partitioning**: Events distributed across multiple partitions *[Source: Kafka topic configurations in `lib/stacks/data.ts`]*

## Operational Procedures

### Deployment Process

1. **Feature Development**: Work on feature branch *[Source: Git workflow]*
2. **Pull Request**: Automated testing and review *[Source: `.github/workflows/deploy.yml` lines 32-44]*
3. **Branch Deployment**: Automatic deployment to AWS environment *[Source: `.github/workflows/deploy.yml` lines 45-88]*
4. **End-to-End Testing**: Automated Playwright tests *[Source: `.github/workflows/deploy.yml` lines 113-181]*
5. **Security Scanning**: CloudFormation template security analysis *[Source: `.github/workflows/deploy.yml` lines 196-226]*
6. **Merge to Main**: Production deployment via semantic release *[Source: `.github/workflows/deploy.yml` lines 265-282, `package.json` lines 92-105]*

### Monitoring and Maintenance

- **Daily Health Checks**: Automated monitoring of key metrics *[Source: CloudWatch configurations in `lib/stacks/`]*
- **Consumer Lag Monitoring**: Kafka consumer lag alerts *[Source: `lib/lambda/checkConsumerLag.ts`, `lib/stacks/data.ts` Step Functions]*
- **Error Rate Monitoring**: Lambda function error rate tracking *[Source: `lib/stacks/email.ts` lines 283-290]*
- **Performance Monitoring**: Response time and throughput metrics *[Source: CloudWatch metrics in stack configurations]*

### Disaster Recovery

- **Multi-AZ Deployment**: High availability across availability zones *[Source: `lib/stacks/data.ts` lines 175-177]*
- **Automated Backups**: OpenSearch snapshots and S3 versioning *[Source: AWS service defaults]*
- **Infrastructure as Code**: Complete environment recreation via CDK *[Source: `lib/stacks/`, `cdk.json`]*
- **Data Replay**: Kafka event replay capability for data recovery *[Source: `lib/stacks/data.ts` Step Functions lines 554-629]*

## Step Functions Workflow

### Event Replay System

OneMAC includes a sophisticated Step Functions workflow for replaying Kafka events *[Source: `lib/stacks/data.ts` lines 554-629]*:

```mermaid
graph TB
    subgraph "Step Functions Workflow"
        Start[Start Replay]
        CheckLag[Check Consumer Lag]
        CreateTriggers[Create Kafka Triggers]
        WaitForData[Wait for Data Processing]
        CheckProgress[Check Processing Progress]
        DeleteTriggers[Delete Triggers]
        Complete[Complete]
    end
    
    subgraph "Lambda Functions"
        CheckConsumerLag[checkConsumerLag Lambda]
        CreateTriggersLambda[createTriggers Lambda]
        DeleteTriggersLambda[deleteTriggers Lambda]
    end
    
    subgraph "Kafka Topics"
        OneMacTopic[aws.onemac.migration.cdc]
        SeatoolTopic[aws.seatool.ksql.onemac.three.agg.State_Plan]
        ChangelogTopic[aws.seatool.debezium.changed_date.SEA.dbo.State_Plan]
    end
    
    Start --> CheckLag
    CheckLag --> CheckConsumerLag
    CheckConsumerLag --> CreateTriggers
    CreateTriggers --> CreateTriggersLambda
    CreateTriggersLambda --> WaitForData
    WaitForData --> CheckProgress
    CheckProgress --> DeleteTriggers
    DeleteTriggers --> DeleteTriggersLambda
    DeleteTriggersLambda --> Complete
    
    CreateTriggersLambda --> OneMacTopic
    CreateTriggersLambda --> SeatoolTopic
    CreateTriggersLambda --> ChangelogTopic
```

### Replay Capabilities

The Step Functions workflow enables:

- **Historical Data Replay**: Replay events from specific timestamps *[Source: `lib/lambda/checkConsumerLag.ts`]*
- **Selective Topic Replay**: Choose which Kafka topics to replay *[Source: `lib/stacks/data.ts` lines 576-623]*
- **Progress Monitoring**: Track replay progress and consumer lag *[Source: `lib/lambda/checkConsumerLag.ts`]*
- **Automatic Cleanup**: Remove temporary triggers after replay completion *[Source: `lib/lambda/deleteTriggers.ts`]*

## Human Intervention Points

### Required Manual Processes

1. **User Role Approval**: CMS role approvers must manually approve state user access requests (via SEATool)
2. **RAI Review**: CMS reviewers manually review submissions and create RAI requests in SEATool
3. **Package Approval**: Final CMS approval requires human review and decision in SEATool
4. **Incident Response**: Manual intervention required for system alerts and failures
5. **Configuration Changes**: Environment-specific configuration updates

### Automated Processes

- **Data Synchronization**: Automatic sync between OneMAC, SEATool, and SEATool via BigMAC
- **Email Notifications**: Automatic email triggers for status changes
- **Status Updates**: Automatic status reconciliation between systems
- **File Processing**: Automatic virus scanning and file validation
- **Index Management**: Automatic OpenSearch index creation and mapping updates

## SEATool Integration

### CMS Workflow via SEATool

CMS users interact with OneMAC submissions through a separate application called **SEATool**:

```mermaid
sequenceDiagram
    participant State as State User
    participant OneMAC as OneMAC Application
    participant Kafka as Kafka/BigMAC
    participant SEATool as SEATool Application
    participant CMS as CMS Reviewer
    
    State->>OneMAC: Submit package
    OneMAC->>Kafka: Publish submission event
    Kafka->>SEATool: Package appears in SEATool
    
    CMS->>SEATool: Review package
    SEATool->>Kafka: Status update (via BigMAC topics)
    Kafka->>OneMAC: Update package status
    OneMAC->>State: Email notification of status change
    
    Note over SEATool,CMS: CMS users never directly<br/>access OneMAC interface
    Note over Kafka: BigMAC topics carry<br/>SEATool status updates
```

### SEATool Responsibilities

- **Package Review**: CMS reviewers examine submissions and supporting documents
- **RAI Creation**: Generate requests for additional information
- **Status Management**: Update package statuses (approve, disapprove, request changes)
- **Communication**: Trigger email notifications back to state users

### BigMAC Topic Integration

BigMAC (the Kafka topic system) carries SEATool updates to OneMAC:

- **Status Changes**: Approval, disapproval, RAI requests
- **Review Comments**: CMS reviewer feedback and notes
- **Workflow Updates**: Package progression through CMS review process

## Data Sources and Integration

### Primary Data Sources

```mermaid
graph TB
    subgraph "External Systems"
        SEATool[SEATool<br/>- Official CMS system<br/>- Status authority<br/>- Reference data]
        OneMAC[Legacy OneMAC<br/>- Historical submissions<br/>- User data<br/>- Legacy workflows]
        SEATool[SEATool<br/>- CMS user interface<br/>- Package review<br/>- Status updates]
        IDM[Identity Management<br/>- User authentication<br/>- Role assignments]
    end
    
    subgraph "Integration Layer"
        Debezium[Debezium CDC<br/>- Database change capture<br/>- Real-time sync]
        Kafka[Kafka Streams<br/>- Event streaming<br/>- Message queuing]
        Transform[Data Transformation<br/>- Schema mapping<br/>- Validation]
    end
    
    subgraph "OneMAC System"
        OpenSearch[OpenSearch<br/>- Unified data store<br/>- Search index]
        Application[OneMAC Application<br/>- User interface<br/>- Business logic]
    end
    
    SEATool --> Debezium
    OneMAC --> Kafka
    SEATool --> Kafka
    IDM --> Application
    
    Debezium --> Kafka
    Kafka --> Transform
    Transform --> OpenSearch
    OpenSearch --> Application
```

### Data Reconciliation

The system implements sophisticated data reconciliation logic:

- **Timestamp-based Conflict Resolution**: Uses timestamps to determine data freshness
- **Status Priority Rules**: OneMAC statuses take precedence for specific scenarios
- **Bi-directional Sync**: Changes flow both ways between systems
- **Conflict Detection**: Automatic detection and logging of data conflicts

## Future Considerations

### Planned Enhancements

1. **API Modernization**: Migration to GraphQL for more efficient data fetching
2. **Real-time Updates**: WebSocket integration for live status updates
3. **Advanced Analytics**: Enhanced reporting and dashboard capabilities
4. **Mobile Optimization**: Improved mobile experience for field users
5. **AI Integration**: Automated document analysis and validation

### Technical Debt

1. **Legacy Code Cleanup**: Gradual removal of OneMAC compatibility code
2. **Schema Standardization**: Unification of data schemas across systems
3. **Performance Optimization**: Query optimization and caching improvements
4. **Documentation Updates**: Continuous documentation maintenance

## Troubleshooting Guide

### Common Issues

1. **Consumer Lag**: Monitor Kafka consumer lag metrics
2. **OpenSearch Performance**: Monitor query response times and cluster health
3. **Email Delivery**: Check SES sending statistics and bounce rates
4. **Authentication Issues**: Verify Cognito and IDM integration
5. **Data Sync Problems**: Check Kafka topic health and Lambda error rates

### Support Contacts

- **Development Team**: Primary development and maintenance
- **DevOps Team**: Infrastructure and deployment support
- **CMS Business Team**: Business requirements and user support
- **Security Team**: Security compliance and incident response

## Conclusion

OneMAC represents a comprehensive modernization of the Medicaid waiver and state plan submission process. The application successfully bridges legacy systems while providing a modern, accessible, and scalable platform for state government users. CMS users continue to use SEATool for package review and approval, with status updates flowing back to OneMAC through BigMAC Kafka topics. The event-driven architecture ensures data consistency across multiple systems while the robust testing strategy maintains high quality and accessibility standards.

The system's design emphasizes reliability, security, and user experience while maintaining the complex business logic required for healthcare policy administration. The separation of concerns between OneMAC (state users) and SEATool (CMS users) allows each system to be optimized for its specific user base while maintaining seamless data integration. The extensive monitoring and alerting capabilities ensure operational excellence, while the comprehensive testing strategy maintains code quality and accessibility compliance.

## Quick Start Guide for New Team Members

**What OneMAC Does**: OneMAC is essentially a digital submission portal where state government employees submit healthcare policy documents (Medicaid waivers and state plan amendments) to CMS for approval. Think of it as a sophisticated form system with file uploads, status tracking, and email notifications. State users fill out forms, upload supporting documents, and track their submission status, while CMS reviewers work in a separate system called SEATool to review and approve these submissions.

**How Data Flows**: The application follows an event-driven architecture centered around Kafka message streams. When a state user submits a form through the React frontend, it triggers a Lambda function that stores files in S3 and publishes an event to Kafka. Multiple "sink" Lambda functions consume these Kafka events and index the data into OpenSearch (our search database). When CMS users make decisions in SEATool, those changes also flow through Kafka back to OneMAC, keeping both systems synchronized. Email notifications are automatically triggered at key points in this workflow.

**Technical Structure**: The codebase is organized into clear layers - React frontend (`react-app/`), Lambda backend functions (`lib/lambda/`), AWS infrastructure definitions (`lib/stacks/`), shared TypeScript types (`lib/packages/shared-types/`), and comprehensive tests (`test/`). The infrastructure is defined as code using AWS CDK, and everything deploys automatically through GitHub Actions. Each Git branch gets its own complete AWS environment, making it safe to develop and test features in isolation.

**Key Integration Points**: The most complex part of the system is reconciling data between three sources: new OneMAC submissions, legacy OneMAC historical data, and authoritative SEATool data. The `sinkMainProcessors.ts` file contains the business logic that handles conflicts between these systems - for example, determining whether a OneMAC withdrawal request should override a SEATool status update based on timestamps. Understanding this reconciliation logic is crucial for maintaining data integrity across the entire healthcare policy workflow.
