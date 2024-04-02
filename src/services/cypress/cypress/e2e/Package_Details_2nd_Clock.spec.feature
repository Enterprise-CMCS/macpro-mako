Feature: 2nd Clock in package details
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
    Scenario: Screen Enhance - Valid Pending Package - CMS
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button
        Then search for "MD-22-2200-VM"
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending"
        Then verify 2nd clock is visible under the status

    Scenario: Screen Enhance - Valid Pending Package - State
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "MD-22-2200-VM"
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Under Review"
        Then verify 2nd clock is not visible under the status


    Scenario: Screen Enhance - Valid Pending - Concurrence Package - CMS
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button
        Then search for "MD-22-2303-VM"
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - Concurrence"
        Then verify 2nd clock is visible under the status

    Scenario: Screen Enhance - Valid Pending - Concurrence Package - State
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "MD-22-2303-VM"
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Under Review"
        Then verify 2nd clock is not visible under the status

    Scenario: Screen Enhance - Valid Pending - Approval Package - CMS
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for "MD-22004.R00.00"
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - Approval"
        Then verify 2nd clock is visible under the status

    Scenario: Screen Enhance - Valid Pending - Approval Package -  State
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for "MD-22004.R00.00"
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Under Review"
        Then verify 2nd clock is not visible under the status

    Scenario: Screen Enhance - Without RAI Pending Package - CMS
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button
        Then search for "MD-22-2300-VM"
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending"
        Then verify 2nd clock is not visible under the status

    Scenario: Screen Enhance - Without RAI Pending Package - State
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "MD-22-2300-VM"
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Under Review"
        Then verify 2nd clock is not visible under the status