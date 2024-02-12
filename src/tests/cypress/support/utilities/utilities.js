//Here we can add all common utilities then export and import in other files as we need them.
//We can also move these files to Common package under integration. Both are considered best practices.

export class utilities {
  generateSPAID(state) {
    //takes last 2 digits of current year
    let year = new Date().getFullYear().toString().slice(-2);
    //picks a number between 0000 and 9999
    let number = ('0000' + Math.floor( + Math.random() * 9999)).slice(-4);
    // SS-YY-NNNN
    let spaID = state + "-" + year + "-" + number + "-" + "VM";
    return spaID;
  }

  waitForSpinnders() {
    cy.waitForSpinners();
  }

  generateWaiverNumberWith5Characters(state) {
    let num1 = Math.floor(Math.random() * Math.floor(80)) + 10;
    let num2 = Math.floor(Math.random() * Math.floor(80)) + 10;
    let num3 = Math.floor(Math.random());
    // SS.#####
    let waiverNumber = state + "." + num1 + "" + num2 + "" + num3;
    return waiverNumber;
  }

  generateInitialWaiverNumberWith5Digits(state) {
    //picks a number between 00000 and 99999
    let number = ('00000' + Math.floor( + Math.random() * 99999)).slice(-5);
    // SS-#####.R00.00
    let waiverNumber = state + "." + number + ".R00.00";
    return waiverNumber;
  }

  generateInitialWaiverNumberWith4Digits(state) {
    //picks a number between 00000 and 99999
    let number = ('0000' + Math.floor( + Math.random() * 9999)).slice(-4);
    // SS-####.R00.00
    let waiverNumber = state + "." + number + ".R00.00";
    return waiverNumber;
  }

  generateRenewalWaiverNumberWith5Digits(state) {
    //picks a number between 00000 and 99999
    let number = ('00000' + Math.floor( + Math.random() * 99999)).slice(-5);
    // SS-#####.R01.00
    let waiverNumber = state + "." + number + ".R01.00";
    return waiverNumber;
  }

  generateRenewalWaiverNumberWith4Digits(state) {
    //picks a number between 0000 and 9999
    let number = ('0000' + Math.floor( + Math.random() * 9999)).slice(-4);
    // SS-####.R01.00
    let waiverNumber = state + "." + number + ".R01.00";
    return waiverNumber;
  }
}

export default utilities;
