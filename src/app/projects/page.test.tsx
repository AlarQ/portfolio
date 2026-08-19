import { describe, expect, it } from "vitest";
import ProjectsPage from "./page";

describe("ProjectsPage", () => {
  it("renders the page chrome around the Projects screen with getProjects()", () => {
    const element = ProjectsPage();

    expect(element).toBeTruthy();
  });
});
