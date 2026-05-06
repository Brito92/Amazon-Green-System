import { expect, type Page } from "@playwright/test";
import { AppShellPage } from "./AppShellPage";

export class ReflorestePage {
  readonly page: Page;
  readonly shell: AppShellPage;

  constructor(page: Page) {
    this.page = page;
    this.shell = new AppShellPage(page);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/refloreste/);
    await expect(this.page.getByRole("heading", { name: /refloreste e ganhe/i })).toBeVisible();
    await expect(this.page.getByRole("tab", { name: /nova muda/i })).toBeVisible();
    await expect(this.page.getByRole("tab", { name: /novo consórcio|novo consorcio/i })).toBeVisible();
  }
}
