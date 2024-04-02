//Here we can add all common utilities then export and import in other files as we need them.
//We can also move these files to Common package under integration. Both are considered best practices.

export class utilities {
  spaIDCounter(lastSPAID = 0) {
    let number = parseInt(lastSPAID);
    if(number < 1000){
     return ('0000' + (number + 1)).slice(-4);
    } else if(number === 9999){
      return '0000'; //resets the number
    } else {
      return number += 1;
    }
  }

  firstpartCounter(lastfirstPartCounter = 1000) {
    if(lastfirstPartCounter < 1000){
      return 1000;
    } else if(lastfirstPartCounter === 2999){
      return 10000;
    } else {
      return lastfirstPartCounter += 1;
    }
  }

  //for amendment and renewal waiver number generation 01-99
  doubleDigitCounter(twoDigitCount) {
    twoDigitCount = parseInt(twoDigitCount);
    if (twoDigitCount === (99 || "99" || "00" | 0)) {
      //digits are 99 so we reset them.
      return "01";
    } else {
     //digits are not 99 so we count up by 1
      twoDigitCount += 1;
      if (twoDigitCount < 10) {
        //when the number is a single digit, pad the number with 0 to fit ID format
        return "0" + twoDigitCount;
      } else {
        //return
        return twoDigitCount;
      }
    }
  }
}

export default utilities;
