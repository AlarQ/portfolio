# E2E Testing with Playwright

This document explains how to run and write end-to-end tests using Playwright for the portfolio website.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Writing New Tests](#writing-new-tests)
- [Test Structure](#test-structure)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Playwright is used for end-to-end testing of the Next.js portfolio website. It tests critical user flows across multiple browsers (Chrome, Firefox, Safari) and devices (desktop, mobile).

### What We Test

- **Happy Paths**: Normal user interactions and page loads
- **Critical Features**: Homepage, projects page, navigation
- **Responsive Design**: Layouts on different screen sizes
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

### Test Location

All E2E tests are located in the `e2e/` directory:
- `e2e/home.spec.ts` - Homepage tests
- `e2e/projects.spec.ts` - Projects page tests

---

## Running Tests

### Run All Tests (Headless)

Run all E2E tests in headless mode (default):

```bash
npm run test:e2e
```

### Run Tests in UI Mode

Open the Playwright Test UI to see tests run in real-time with a visual interface:

```bash
npm run test:e2e:ui
```

The UI mode allows you to:
- Watch tests execute step-by-step
- Inspect page state at any point
- Replay test runs
- Debug failing tests

### Run Tests in Debug Mode

Step through tests with the Playwright Inspector:

```bash
npm run test:e2e:debug
```

This opens a browser and pauses execution so you can:
- Inspect elements
- View network requests
- Check console logs
- Step through each action

### Run Tests in Headed Mode

Run tests with visible browsers:

```bash
npm run test:e2e:headed
```

### Run Specific Test File

Run tests from a single file:

```bash
npx playwright test e2e/home.spec.ts
```

### Run Tests in Specific Browser

Run tests only in a specific browser:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This opens a detailed report showing:
- Test results (pass/fail)
- Screenshots of failures
- Video recordings
- Execution traces

---

## Writing New Tests

### Test File Naming Convention

Use the `.spec.ts` extension for test files:
- `homepage.spec.ts`
- `projects.spec.ts`
- `navigation.spec.ts`

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Page Name", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page before each test
    await page.goto("/your-page");
  });

  test("descriptive test name", async ({ page }) => {
    // Arrange: Set up test data

    // Act: Perform the action

    // Assert: Verify the result
  });
});
```

### Test Page Load

```typescript
test("page loads successfully", async ({ page }) => {
  await page.goto("/your-page");

  // Check page title
  await expect(page).toHaveTitle(/Expected Title/);

  // Check main heading
  const heading = page.getByRole("heading", { name: "Page Title" });
  await expect(heading).toBeVisible();
});
```

### Test Element Visibility

```typescript
test("element is displayed", async ({ page }) => {
  await page.goto("/");

  // By text
  const element = page.getByText("Hello World");
  await expect(element).toBeVisible();

  // By role (accessible name)
  const button = page.getByRole("button", { name: "Submit" });
  await expect(button).toBeVisible();

  // By test ID (recommended for interactive elements)
  const submitBtn = page.getByTestId("submit-button");
  await expect(submitBtn).toBeVisible();
});
```

### Test Click Actions

```typescript
test("clicking button navigates to new page", async ({ page }) => {
  await page.goto("/");

  // Click on a link or button
  await page.getByRole("link", { name: "Projects" }).click();

  // Verify navigation
  await expect(page).toHaveURL(/\/projects/);
  await expect(page.getByRole("heading", { name: "My Projects" })).toBeVisible();
});
```

### Test Form Input

```typescript
test("form submission works", async ({ page }) => {
  await page.goto("/contact");

  // Fill input fields
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Message").fill("Hello!");

  // Submit form
  await page.getByRole("button", { name: "Send" }).click();

  // Verify success
  await expect(page.getByText("Message sent")).toBeVisible();
});
```

### Test Responsive Layouts

```typescript
test("layout is responsive", async ({ page }) => {
  await page.goto("/");

  // Test mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator(".mobile-nav")).toBeVisible();

  // Test desktop
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(page.locator(".desktop-nav")).toBeVisible();
});
```

---

## Test Structure

### AAA Pattern (Arrange-Act-Assert)

Every test should follow the AAA pattern for clarity:

```typescript
test("user can add item to cart", async ({ page }) => {
  // ARRANGE: Set up the test
  await page.goto("/products");
  const product = page.getByText("Cool Product");

  // ACT: Perform the action
  await product.click();
  await page.getByRole("button", { name: "Add to Cart" }).click();

  // ASSERT: Verify the result
  await expect(page.getByText("Item added to cart")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart" })).toContainText("1");
});
```

### Positive vs Negative Tests

**Positive Test**: Test that things work as expected
```typescript
test("login succeeds with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("correctPassword");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

**Negative Test**: Test that failures are handled correctly
```typescript
test("login fails with invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("wrongPassword");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});
```

### Test Grouping with describe

Group related tests using `test.describe`:

```typescript
test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Portfolio/);
  });

  test("shows profile card", async ({ page }) => {
    await expect(page.getByText("Ernest Bednarczyk")).toBeVisible();
  });
});
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

**Good (tests behavior):**
```typescript
test("user can navigate to projects page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects/);
});
```

**Bad (tests implementation):**
```typescript
test("projects link has correct href", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("a.projects-link");
  await expect(link).toHaveAttribute("href", "/projects");
});
```

### 2. Use Built-in Locators

Prefer Playwright's built-in locators over CSS selectors:

```typescript
// ✅ Good: Use getByText, getByRole, getByLabel
await page.getByText("Submit").click();
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email").fill("test@example.com");

// ❌ Bad: CSS selectors are fragile
await page.locator("button.submit-btn").click();
await page.locator("input[type='email']").fill("test@example.com");
```

### 3. Wait for Elements Appropriately

```typescript
// ✅ Good: Use expect().toBeVisible()
await expect(page.getByText("Loaded")).toBeVisible();

// ❌ Bad: Hard-coded timeouts
await page.waitForTimeout(3000);
```

### 4. One Assertion Per Test

Keep tests focused on one behavior:

```typescript
// ✅ Good: Single assertion
test("shows profile name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Ernest Bednarczyk")).toBeVisible();
});

// ❌ Bad: Multiple unrelated assertions
test("homepage works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Ernest Bednarczyk")).toBeVisible();
  await expect(page.getByText("ENGINEERING")).toBeVisible();
  await expect(page.getByText("6+")).toBeVisible();
  // ... many more assertions
});
```

### 5. Use Descriptive Test Names

```typescript
// ✅ Good: Clear and specific
test("profile card displays correct name and bio", async ({ page }) => {});

test("navigation to projects page works", async ({ page }) => {});

// ❌ Bad: Vague
test("it works", async ({ page }) => {});
test("test profile", async ({ page }) => {});
```

### 6. Add Test IDs for Interactive Elements

For buttons and interactive components, add `data-testid` attributes:

```tsx
<button data-testid="submit-button">Submit</button>
```

Then in tests:
```typescript
await page.getByTestId("submit-button").click();
```

### 7. Handle Async Operations

The homepage has Suspense boundaries (e.g., ContributionGraph). Use appropriate timeouts:

```typescript
test("contribution graph loads", async ({ page }) => {
  await page.goto("/");
  const graph = page.getByTestId("contribution-graph");
  await expect(graph).toBeVisible({ timeout: 15000 }); // Longer timeout for async
});
```

---

## Troubleshooting

### Tests Failing with "Timed Out"

**Problem**: Test waits too long for an element to appear.

**Solutions**:
1. Increase timeout: `await expect(element).toBeVisible({ timeout: 15000 });`
2. Check if element selector is correct
3. Verify the element exists in the HTML

### Tests Failing with "Element not found"

**Problem**: Playwright can't locate the element.

**Solutions**:
1. Check if element is visible (not `display: none`)
2. Try different locator strategies (getByText, getByRole, getByTestId)
3. Verify element is rendered in the DOM
4. Check for lazy loading - may need to scroll

### Tests Flaky (Sometimes Pass, Sometimes Fail)

**Problem**: Tests are non-deterministic.

**Solutions**:
1. Use `await expect(element).toBeVisible()` instead of `page.waitForTimeout()`
2. Ensure tests don't depend on previous test state
3. Avoid hard-coded timing - wait for elements
4. Check for race conditions with async data loading

### "Dev server failed to start" Error

**Problem**: Playwright can't start the Next.js dev server.

**Solutions**:
1. Check if port 3000 is already in use: `lsof -i :3000`
2. Kill process on port 3000: `kill -9 <PID>`
3. Check if `npm run dev` works manually
4. Increase timeout in `playwright.config.ts`

### Browser Not Installed

**Problem**: Playwright browsers are missing.

**Solution**: Install browsers:
```bash
npx playwright install
```

For CI, install all browsers:
```bash
npx playwright install --with-deps
```

### Tests Pass Locally But Fail in CI

**Common causes**:
1. Different environment variables
2. Different screen resolutions
3. Slower network/data loading
4. Timing issues

**Solutions**:
1. Add appropriate wait times for async operations
2. Use responsive design tests
3. Mock slow network conditions locally
4. Check CI logs for specific errors

### Debugging with Trace Files

When a test fails, Playwright generates a trace file. View it:

```bash
npx playwright show-trace trace.zip
```

This opens the Playwright Trace Viewer where you can:
- See the exact sequence of actions
- Inspect page state at each step
- View network requests
- Check console logs

### Updating Playwright

Update to the latest version:

```bash
npm install -D @playwright/test@latest
npx playwright install --with-deps
```

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Project Testing Standards](/Users/ernestbednarczyk/.config/opencode/context/core/standards/test-coverage.md)
