export const convertRegexToString = (obj: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (value instanceof RegExp) {
        // Convert RegExp to string
        const str = value.toString();
        // save it in this weird array thing
        obj[key] = /\/(.*)\/(.*)/.exec(str);
      } else if (typeof value === "object" && value !== null) {
        // Recursively process nested objects
        obj[key] = convertRegexToString(value);
      }
    }
  }

  return obj;
};

export const reInsertRegex = (obj: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        // If the current property is an object, recursively call the function
        obj[key] = reInsertRegex(obj[key]);

        // Check if the current object has a property "pattern" with a "value" key
        if (
          obj[key].hasOwnProperty("pattern") &&
          typeof obj[key].pattern === "object" &&
          obj[key].pattern.hasOwnProperty("value")
        ) {
          // if its a pattern.value replace the value's value with a regex from the weird array thing
          obj[key].pattern.value = new RegExp(
            obj[key].pattern.value[1],
            obj[key].pattern.value[2]
          );
        }
      }
    }
  }
  return obj;
};
