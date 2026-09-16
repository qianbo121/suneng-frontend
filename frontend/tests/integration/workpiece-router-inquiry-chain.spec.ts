import { expect, test } from '@playwright/test';

const adminBaseURL = process.env.E2E_ADMIN_URL ?? 'http://127.0.0.1:3102';
const adminUsername = process.env.E2E_ADMIN_USERNAME;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test('B25-E2E-001 homepage workpiece context survives the real inquiry transaction and admin detail', async ({
  page,
}) => {
  test.skip(!adminUsername || !adminPassword, 'isolated-clone admin credentials are required');

  const uniqueMarker = `B25-E2E-${Date.now()}`;
  await page.goto('/zh', { waitUntil: 'domcontentloaded' });

  const router = page.locator('#workpiece-router');
  const panel = router.locator('aside');
  await router.scrollIntoViewIfNeeded();
  const purposeSelect = panel.getByRole('combobox');
  await purposeSelect.press('ArrowDown');
  await purposeSelect.press('ArrowDown');
  await purposeSelect.press('Enter');

  // Answer every server-selected question through the public UI. Unknown is a
  // real customer answer and lets the chain exercise storage without inventing
  // engineering compatibility or equipment capability values in the browser.
  for (let step = 0; step < 80; step += 1) {
    const submitContextButton = panel.getByRole('button', { name: /提交工况/ });
    if (await submitContextButton.isVisible().catch(() => false)) break;

    const unknownButton = panel.getByRole('button', { name: '不清楚 / 待确认' });
    await expect(unknownButton).toBeVisible({ timeout: 15_000 });
    const resolveResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/workpiece-router/resolve'),
    );
    await unknownButton.click();
    expect((await resolveResponsePromise).ok()).toBe(true);
  }

  const submitContextButton = panel.getByRole('button', { name: /提交工况/ });
  await expect(submitContextButton).toBeVisible();
  await submitContextButton.click();

  const form = page.locator('#homepage-lead-form form');
  await expect(form).toBeVisible();
  await form.getByLabel('1. 您想咨询什么？').click();
  await form.getByRole('option', { name: '新建热处理生产线' }).click();
  await form.locator('textarea[name="problem"]').fill(`${uniqueMarker} 完整提交链验收`);
  await form.locator('input[name="identity"]').fill('隔离验收企业');
  await form.locator('input[name="contact"]').fill('batch25-e2e@example.test');

  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/api/v2/custom-requirements'),
  );
  await form.getByRole('button', { name: '提交需求' }).click();
  const submitResponse = await submitResponsePromise;
  expect(submitResponse.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: '项目情况已经收到' })).toBeVisible();

  const submissionId = (
    await page.locator('dt', { hasText: '需求编号' }).locator('..').locator('dd').textContent()
  )?.trim();
  expect(submissionId).toMatch(/^[0-9a-f-]{36}$/i);

  await page.goto(`${adminBaseURL}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('用户名').fill(adminUsername!);
  await page.getByLabel('密码').fill(adminPassword!);
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes('/api/admin/auth/login'),
  );
  await page.getByRole('button', { name: '登录并进入仪表盘' }).click();
  expect((await loginResponsePromise).ok()).toBe(true);
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
  await page.goto(`${adminBaseURL}/custom-requirements`, { waitUntil: 'domcontentloaded' });

  const search = page.getByPlaceholder('搜索编号 / 姓名 / 电话 / 邮箱 / 公司 / 地点');
  await search.fill(submissionId!);
  const searchResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/api/admin/custom-requirements/search'),
  );
  await search.press('Enter');
  expect((await searchResponsePromise).ok()).toBe(true);
  const resultRow = page.getByRole('row').filter({ hasText: submissionId!.slice(0, 8) });
  await expect(resultRow).toBeVisible();
  await resultRow.getByRole('button', { name: '工况详情' }).click();

  await expect(page.getByText('工件判断上下文', { exact: true })).toBeVisible();
  await expect(page.getByText('客户填写的原始工况', { exact: true })).toBeVisible();
  await expect(page.getByText('不清楚/待确认', { exact: false }).first()).toBeVisible();
  await expect(
    page.getByText('以上工况由客户自报，仅用于初步判断', { exact: false }),
  ).toBeVisible();
});
