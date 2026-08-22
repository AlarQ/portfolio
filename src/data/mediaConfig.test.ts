import { afterEach, describe, expect, it, vi } from "vitest";
import { getMediaBaseUrl, resolveMediaBaseUrl } from "./mediaConfig";

describe("resolveMediaBaseUrl", () => {
  it("falls back to /media when the raw value is undefined", () => {
    expect(resolveMediaBaseUrl(undefined)).toBe("/media");
  });

  it("falls back to /media when the raw value is empty or whitespace-only", () => {
    expect(resolveMediaBaseUrl("")).toBe("/media");
    expect(resolveMediaBaseUrl("   ")).toBe("/media");
  });

  it("strips a trailing slash from an authored base URL", () => {
    expect(resolveMediaBaseUrl("https://example.blob.vercel-storage.com/")).toBe(
      "https://example.blob.vercel-storage.com"
    );
  });

  it("returns an already-clean absolute URL unchanged", () => {
    expect(resolveMediaBaseUrl("https://example.blob.vercel-storage.com")).toBe(
      "https://example.blob.vercel-storage.com"
    );
  });
});

describe("getMediaBaseUrl - media-base-url-swap", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads MEDIA_BASE_URL from the environment", () => {
    vi.stubEnv("MEDIA_BASE_URL", "https://example.blob.vercel-storage.com");
    expect(getMediaBaseUrl()).toBe("https://example.blob.vercel-storage.com");
  });

  it("falls back to /media when MEDIA_BASE_URL is unset", () => {
    vi.stubEnv("MEDIA_BASE_URL", "");
    expect(getMediaBaseUrl()).toBe("/media");
  });
});
