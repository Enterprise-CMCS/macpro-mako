import { describe, it, expect } from "vitest";
import { removeUnderscoresAndCapitalize, convertCamelCaseToWords } from "./textHelpers";

describe("removeUnderscoresAndCapitalize", () => {
  it("should replace underscores with spaces and capitalize each word", () => {
    expect(removeUnderscoresAndCapitalize("hello_world")).toBe("Hello World");
    expect(removeUnderscoresAndCapitalize("remove_this_string")).toBe("Remove This String");
  });

  it('should remove trailing "s" from the end of the capitalized string', () => {
    expect(removeUnderscoresAndCapitalize("dogs")).toBe("Dog");
    expect(removeUnderscoresAndCapitalize("cat_and_dogs")).toBe("Cat And Dog");
  });

  it("should handle empty strings", () => {
    expect(removeUnderscoresAndCapitalize("")).toBe("");
  });

  it("should handle strings without underscores", () => {
    expect(removeUnderscoresAndCapitalize("hello")).toBe("Hello");
    expect(removeUnderscoresAndCapitalize("test")).toBe("Test");
  });
});

describe("convertCamelCaseToWords", () => {
  it("should convert camel case to words", () => {
    expect(convertCamelCaseToWords("helloWorld")).toBe("Hello World");
    expect(convertCamelCaseToWords("convertCamelCaseToWords")).toBe("Convert Camel Case To Words");
  });

  it("should handle leading uppercase letters", () => {
    expect(convertCamelCaseToWords("CamelCase")).toBe("Camel Case");
    expect(convertCamelCaseToWords("HelloWorld")).toBe("Hello World");
  });

  it("should handle no camel case", () => {
    expect(convertCamelCaseToWords("justwords")).toBe("Justwords");
  });
});
