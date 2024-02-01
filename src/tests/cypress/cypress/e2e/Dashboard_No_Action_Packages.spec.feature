Feature: Withdraw package action in package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: Demonstrate that withdraw a package is not available on SPA with Submitted status
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Submitted checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Submitted status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Submitted checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on SPA with Package Withdrawn status
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click the Package Withdrawn checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Package Withdrawn status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click the Package Withdrawn checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on SPA with Approved status
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Approved checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Approved status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type
        Then click 1915b Initial Waiver check box
        Then click 1915b Waiver Renewal check box
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Approved checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on SPA with Disapproved status
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Disapproved checkbox
        Then verify the actions button is disabled in the package dashboard

    Scenario: Demonstrate that withdraw a package is not available on Waiver with Disapproved status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Disapproved checkbox
        Then verify the actions button is disabled in the package dashboard