import { expect, type Page } from "@playwright/test";
import { AppShellPage } from "./AppShellPage";

export class MapaPage {
  readonly page: Page;
  readonly shell: AppShellPage;

  constructor(page: Page) {
    this.page = page;
    this.shell = new AppShellPage(page);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/mapa/);
    await expect(this.page.getByRole("heading", { name: /mapa ambiental/i })).toBeVisible();
  }
}
