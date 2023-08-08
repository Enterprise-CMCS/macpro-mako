# ui-auth

## Configuration - AWS Systems Manager Parameter Store (SSM)

The following values are used to configure the deployment of this service (see below for more background and context):
| Parameter | Required? | Purpose |
| --- | :---: | --- |
| /{$PROJECT}/{$STAGE \|\| "default"}/iam/path | N | Specifies the [IAM Path](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_identifiers.html#identifiers-friendly-names) at which all IAM objects should be created.|
| /{$PROJECT}/{$STAGE \|\| "default"}/iam/permissionsBoundaryPolicy | N | Specifies the [IAM Permissions Boundary](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) that should be attached to all IAM objects.|
| /{$PROJECT}/{$STAGE \|\| "default"}/sesSourceEmailAddress | N | The email address with which the appication sends emails. This email address must be verified in SES and your AWS account must be [out of the SES Sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html). Note: You do not need to set this SSM parameter to deploy this service and the application as a whole. However, if not set, the 'send user a submission confirmation email' functionality will not be functional.|
| /{$PROJECT}/{$STAGE \|\| "default"}/sesRegion | N | The region in which sesSourceEmailAddress (see above) exists. By default, the deployment will assume the email exists as a verified identity in the same region to which the application is being deployed. So if you're deploying to us-west-2, the deployment will look for the email address in us-west-2 by default. However, if you wanted to make use of an already verified email in another region for convenience's sake, this parameter allows for that. So if you're deploying to us-west-2 but want to use a verified identity in us-east-1, set this parameter to us-east-1.|
| /{$PROJECT}/{$STAGE}/okta_metadata_url | N | The SAML Metadata url for Okta, gotten from Okta's admin console from the app. Specifying this parameter for a stage configures the application's Cognito to be backed with Okta. NOTE: this variable does not accept a default SSM parameter; any parameter set must be scoped to a specific stage.|
| /{$PROJECT}/{$STAGE \|\| "default"}/cognito/bootstrapUsers/enabled | N | Set this to 'true' to configure several CI/test users in the environment during deployment. For safety reasons, this is off by default. A recommended approach is to set this to 'true' by default, and set a stage specific variable for staging/production to be 'false', if desired.|
| /{$PROJECT}/{$STAGE \|\| "default"}/cognito/bootstrapUsers/password | N | This parameter holds the password for the CI/test users optionally generated during deployment (see cognito/bootstrapUsers/enabled above). There is no default; if you enable bootstrapUsers functionality, set a password to be used.|

This project uses [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html), often shortened to just SSM, to inject environment specific, project specific, and/or sensitive information into the deployment.

SSM parameters for this project have a top level namespace of /{$PROJECT}/. The PROJECT environment variable resolves to the github repo name.

- For example: SSM Parameters for this project are all set under /webapp-accelerator/

This project has also implemented a pattern for specifying defaults for variables in default SSM parameters, while allowing for stage (branch, environment) specific overrides in stage specific SSM parameters.

- For example: Setting the SSM parameter "/webapp-accelerator/default/iam/permissionsBoundaryPolicy" to be "arn:aws:xxxxxx" in SSM would apply "arn:aws:xxxxxx" to all branches by default. However, if you also set "/webapp-accelerator/main/iam/permissionsBoundaryPolicy" to "arn:aws:yyyyyy", the main specific value of "arn:aws:yyyyyy" would take effect on just the main branch. This is the gist of stage specific overrides, and it's the nature of the {$STAGE || "default"} syntax above.

Please see the [SSM wiki section](wikilink) for more information.
