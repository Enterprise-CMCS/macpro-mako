Feature: A Basic Smoke test
    Scenario: Verify the home page is visible
        Given I navigate to the Login Page
        When the page loads
        Then I am on the home page and not logged in