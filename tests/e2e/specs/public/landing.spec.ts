import { expect, test } from "@playwright/test";
import { LandingPage } from "../../pages/LandingPage";
import { LoginPage } from "../../pages/LoginPage";

test.describe("Landing pública", () => {
  test("apresenta o sistema e expõe o link do APK", async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();
    await landingPage.expectLoaded();
    await landingPage.expectDownloadLink();
  });

  test("botão acessar leva para o login", async ({ page }) => {
    const landingPage = new LandingPage(page);
    const loginPage = new LoginPage(page);

    await landingPage.goto();
    await landingPage.openLogin();

    await loginPage.expectLoaded();
    await expect(page).toHaveURL(/\/login/);
  });
});
