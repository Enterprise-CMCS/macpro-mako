const fs = require("fs");

const utilities = require("../support/utilities/utilities");

const cucumber = require("cypress-cucumber-preprocessor").default;

module.exports = (on, config) => {
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
  on("file:preprocessor", cucumber());

  on("task", {
    generateWaiverNumber({ filename, digits }) {
      const fullName = "fixtures/" + filename + ".txt";
      if (!fs.existsSync(fullName)) {
        fs.writeFileSync(
          fullName,
          new utilities()
            .generateWaiverNumberWith5Characters("MD")
            .substring(0, digits + 3)
        );
      }
      return null;
    },
  });

  return config;
};
