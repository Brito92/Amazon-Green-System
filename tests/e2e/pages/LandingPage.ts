import { expect, type Page } from "@playwright/test";

export class LandingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.getByText(/Amazon Green System/i).first()).toBeVisible();
    await expect(this.page.getByText(/uma plataforma para registrar/i)).toBeVisible();
    await expect(this.page.getByRole("link", { name: /acessar o sistema/i }).first()).toBeVisible();
    await expect(this.page.getByRole("link", { name: /baixar apk/i }).first()).toBeVisible();
  }

  async expectDownloadLink() {
    await expect(this.page.getByRole("link", { name: /baixar apk/i }).first()).toHaveAttribute(
      "href",
      "/apk/app-debug.apk",
    );
  }

  async openLogin() {
    await this.page.getByRole("link", { name: /acessar o sistema/i }).first().click();
  }
}
