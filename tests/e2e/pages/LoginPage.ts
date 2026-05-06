import { expect, type Page } from "@playwright/test";
import type { E2ECredentials } from "../fixtures/credentials";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(redirect?: string) {
    const suffix = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
    await this.page.goto(`/login${suffix}`);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.page.getByRole("heading", { name: /entrar na plataforma/i })).toBeVisible();
    await expect(this.page.locator("#email")).toBeVisible();
    await expect(this.page.locator("#password")).toBeVisible();
  }

  async signIn(credentials: E2ECredentials) {
    await this.page.locator("#email").fill(credentials.email);
    await this.page.locator("#password").fill(credentials.password);
    await this.page.getByRole("button", { name: /^entrar$/i }).click();
  }
}
