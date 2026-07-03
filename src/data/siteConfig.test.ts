import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./siteConfig";

describe("resolveSiteUrl — fail-fast on missing/invalid SITE_URL", () => {
  it("throws a clear, developer-facing error when SITE_URL is undefined", () => {
    expect(() => resolveSiteUrl(undefined)).toThrow(/SITE_URL/);
  });

  it("throws when SITE_URL is empty", () => {
    expect(() => resolveSiteUrl("")).toThrow(/SITE_URL/);
  });

  it("throws when SITE_URL is whitespace-only", () => {
    expect(() => resolveSiteUrl("   ")).toThrow(/SITE_URL/);
  });

  it("throws when SITE_URL is malformed (not a valid absolute URL)", () => {
    expect(() => resolveSiteUrl("not-a-url")).toThrow(/SITE_URL/);
  });

  it("returns the validated, normalized URL string when SITE_URL is a well-formed absolute URL", () => {
    expect(resolveSiteUrl("https://ernest.dev")).toBe("https://ernest.dev/");
  });
});
