import { expect, type Page } from "@playwright/test";
import { AppShellPage } from "./AppShellPage";

export class DashboardPage {
  readonly page: Page;
  readonly shell: AppShellPage;

  constructor(page: Page) {
    this.page = page;
    this.shell = new AppShellPage(page);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await this.shell.expectVisible();
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(this.page.getByText(/mudas no sistema/i)).toBeVisible();
  }
}
