import { test } from "@playwright/test";
import { getE2ECredentials } from "../../fixtures/credentials";
import { DashboardPage } from "../../pages/DashboardPage";
import { LoginPage } from "../../pages/LoginPage";
import { MapaPage } from "../../pages/MapaPage";
import { ReflorestePage } from "../../pages/ReflorestePage";

test.describe("Fluxos autenticados", () => {
  test.beforeEach(() => {
    test.skip(
      !getE2ECredentials(),
      "Defina E2E_EMAIL e E2E_PASSWORD para rodar os testes autenticados.",
    );
  });

  test("login com e-mail e navegação principal", async ({ page }) => {
    const credentials = getE2ECredentials();
    if (!credentials) test.fail();

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const reflorestePage = new ReflorestePage(page);
    const mapaPage = new MapaPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();
    await loginPage.signIn(credentials!);

    await dashboardPage.expectLoaded();
    await dashboardPage.shell.goToSection("Refloreste e Ganhe");
    await reflorestePage.expectLoaded();

    await reflorestePage.shell.goToSection("Mapa");
    await mapaPage.expectLoaded();

    await mapaPage.shell.signOut();
    await loginPage.expectLoaded();
  });
});
