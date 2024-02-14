Feature: Withdraw package action in package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: Demonstrate that withdraw a package is not available on SPA with Package Withdrawn status
        Then Click on Filter Button
        Then click on Status
        Then click the Package Withdrawn checkbox
        Then Click on the close Filter Button
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Package Withdrawn status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then click the Package Withdrawn checkbox
        Then Click on the close Filter Button
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on SPA with Approved status
        Then Click on Filter Button
        Then click on Status
        Then click Approved checkbox
        Then Click on the close Filter Button
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Approved status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type
        Then click on Action Type
        Then click the Initial check box
        Then click the Renewal check box
        Then click on Status
        Then click Approved checkbox
        Then Click on the close Filter Button
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on SPA with Disapproved status
        Then Click on Filter Button
        Then click on Status
        Then click Disapproved checkbox
        Then Click on the close Filter Button
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Disapproved status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then click Disapproved checkbox
        Then Click on the close Filter Button
        Then verify the actions button is disabled in the package dashboard