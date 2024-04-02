Feature: SPA Form Logic
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on State Plan Amendment SPA

    Scenario: Verify the SPA ID format check on Medicaid SPA
        Then click on Medicaid SPA
        Then click All Other Medicaid SPA Submissions
        Then into "SPA ID" type "MD-22-4235"
        Then set "Proposed Effective Date of Medicaid SPA" to 3 months from today
        Then attach "15MB.pdf" file to attachment 1
        Then verify "SPA ID" has no error messages
        Then attach "adobe.pdf" file to attachment 2
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then into "SPA ID" type "MD-DD-DDDD"
        Then verify the submit button is not disabled
        Then Click the Submit Button without waiting
        Then verify the ID error message is "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX"
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then into "SPA ID" type "MD-22-4235"
        Then verify "SPA ID" has no error messages
        Then verify the submit button is not disabled

    Scenario: Verify the SPA ID format check on CHIP SPA
        Then click on CHIP SPA
        Then click All Other CHIP SPA Submissions
        Then into "SPA ID" type "MD-22-0283-VM"
        Then set "Proposed Effective Date of CHIP SPA" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then attach "adobe.pdf" file to attachment 2
        Then attach "adobe.pdf" file to attachment 3
        Then verify ID error message is not present
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then into "SPA ID" type "MD-DD-DDDD"
        Then verify the submit button is not disabled
        Then Click the Submit Button without waiting
        Then verify the ID error message is "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX"
        Then clear the ID Input box
        Then type "MD-22-0283-VM" into the ID Input box
        Then verify ID error message is not present
        Then verify the submit button is not disabled