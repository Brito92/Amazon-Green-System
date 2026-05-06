import { expect, test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.describe("Proteção de rotas públicas", () => {
  test("rota de login carrega normalmente", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto("/login");

    await loginPage.expectLoaded();
    await expect(page).toHaveURL(/\/login/);
  });
});
