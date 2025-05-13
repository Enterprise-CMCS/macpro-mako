# Test Configuration Setup

With the changes made in PR [1453](https://github.com/Enterprise-CMCS/macpro-mako/pull/1453), the Playwright configuration was mapped to a project based setup. Each project is configured to run with a certain user authentication and `baseURL` sertup.

The following executions are setup as projects:

- local
- ci
- eau
- mfa

The `local` project is intended to be run against the application running on the same machine as the e2e suite.

The `ci` project has a dynamic URL determination has been designed to run when the e2e process is invoked by github.

The `eua` and `mfa` projects are designed for manual execution and require certain environment variables to be confirgured in order to properly execute. Since these setups run over the production environment, grep filters should be applied to prevent data manipulation.

## Environment Variables

The `eua` and `mfa` projects require a username and password to be set as an environment variable prior to execution. For EUA those variables are `EUAID` and `EUAPASSWORD`. For MFA the variables are `ZZSTATEID` and `ZZSTATEPASSWORD`. MFA also requires an additional variable called `TOTPSECRET`, which is required to perform the token request needed for Two-Factor Authentication.
