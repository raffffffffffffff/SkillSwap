import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('Login -> dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('alina@example.com');
  await page.getByLabel('Пароль').fill('password');
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /Привет, Алина/ })).toBeVisible();
});

test('Discover -> filter by skill -> send request', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('link', { name: 'Поиск' }).click();
  await page.locator('select[formcontrolname="skillName"]').selectOption({ label: 'Английский' });
  await page.getByRole('button', { name: 'Предложить обмен' }).first().click();
  await page.getByRole('button', { name: 'Отправить запрос' }).click();
  await page.getByRole('link', { name: 'Запросы' }).click();
  await page.getByRole('button', { name: 'Исходящие' }).click();

  await expect(page.getByText('Английский')).toBeVisible();
});

test('Requests -> accept request -> match appears', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('link', { name: 'Запросы' }).click();
  await page.getByRole('button', { name: 'Принять' }).click();
  await page.getByRole('link', { name: 'Матчи' }).click();

  await expect(page.getByRole('heading', { name: /Марк Волков.*Алина Орлова/ })).toBeVisible();
});
