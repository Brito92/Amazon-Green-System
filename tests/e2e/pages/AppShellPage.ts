import { expect, type Locator, type Page } from "@playwright/test";

export class AppShellPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  navLink(label: string): Locator {
    return this.page.getByRole("link", { name: label });
  }

  async expectVisible() {
    await expect(this.navLink("Dashboard")).toBeVisible();
  }

  async goToSection(label: string) {
    await this.navLink(label).click();
  }

  async signOut() {
    await this.page.getByRole("button", { name: /sair/i }).click();
  }
}
