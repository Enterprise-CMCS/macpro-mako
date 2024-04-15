const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");

async function setupNodeEvents(on, config) {
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.family === 'chromium') {
      launchOptions.args.push('--disable-gpu');
    }
    return launchOptions;
  })
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await preprocessor.addCucumberPreprocessorPlugin(on, config);
  on("file:preprocessor", createBundler({
    plugins: [createEsbuildPlugin.default(config)],
  }));

  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
    table(message) {
      console.table(message);
      return null;
    },
  });

  // Make sure to return the config object as it might have been modified by the plugin.
  return config;
}

module.exports = defineConfig({
  redirectionLimit: 30,
  retries: 1,
  watchForFileChanges: true,
  fixturesFolder: "fixtures",
  screenshotsFolder: "screenshots",
  videosFolder: "videos",
  video: false,
  downloadsFolder: "downloads",
  defaultCommandTimeout: 40001,
  viewportWidth: 1440,
  viewportHeight: 900,
  experimentalStudio: true,
  types: ["cypress", "cypress-axe"],
  env: {
    cognito_url: process.env.COGNITO_URL,
  },
  e2e: {
    setupNodeEvents,
    baseUrl: "https://mako-dev.cms.gov/",
    specPattern: ["cypress/e2e/**/*.feature", "cypress/e2e/**/*.spec.js", "cypress/a11y/**/*.spec.js"],
    supportFile: "support/e2e.js",
    stepDefinitions: ["cypress/e2e/common/steps.js"],
    experimentalRunAllSpecs: true,
  },
});