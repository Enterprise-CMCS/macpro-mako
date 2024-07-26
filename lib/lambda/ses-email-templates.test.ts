import { describe, it, expect } from "vitest";
import getEmailTemplates from "./ses-email-templates";

describe("getEmailTemplates", () => {
  it("should return an array of email templates", async () => {
    const templates = await getEmailTemplates();

    expect(templates).toBeInstanceOf(Array);
    expect(templates.length).toBeGreaterThan(0);

    templates.forEach((template) => {
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(typeof template.name).toBe("string");
      expect(typeof template.subject).toBe("string");
      expect(typeof template.html).toBe("string");
      if (template.text) {
        expect(typeof template.text).toBe("string");
      }
    });
  });

  it("should match the snapshot of email templates", async () => {
    const templates = await getEmailTemplates();
    expect(templates).toMatchSnapshot();
  });
});
