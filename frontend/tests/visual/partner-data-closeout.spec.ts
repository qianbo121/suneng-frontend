import { expect, test } from '@playwright/test';
import { getPartnerMapData } from '../../src/lib/partner-map-data';

const partners = getPartnerMapData();
const jiangsu = partners.filter((partner) => partner.provinceCode === '320000');
const pending = partners.filter((partner) => !partner.provinceCode);
const nonMetalNames = [
  '铜陵欣诺科新材料有限公司',
  '惠柏新材料科技（上海）股份有限公司',
  '河南省科学院材料研究所',
  '德州新景环境科技有限公司',
];

test('desktop map opens the corrected Jiangsu list with a real click', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/zh/partner', { waitUntil: 'networkidle' });
  await expect(page.locator('.suneng-map')).toHaveAttribute('data-enhanced', 'true');
  const marker = page.locator('summary[data-province-code="320000"]');
  await marker.click();
  const panel = page.locator('details[open] .suneng-map-popup');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-partner-id]')).toHaveCount(jiangsu.length);
  for (const id of ['ledger-010', 'ledger-105']) {
    await expect(panel.locator(`[data-partner-id="${id}"]`)).toHaveCount(1);
  }
  await page.screenshot({ path: testInfo.outputPath('desktop-jiangsu.png') });
  await panel.getByRole('button', { name: '关闭江苏省合作伙伴', exact: true }).click();
  await expect(panel).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath(
      testInfo.title.includes('mobile') ? 'mobile-reset.png' : 'desktop-closed.png',
    ),
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  expect(errors).toEqual([]);
});

test('corrected industry filters preserve all customers and their descriptions', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/zh/partner', { waitUntil: 'networkidle' });
  const directory = page.locator('[data-partner-directory]');
  await directory.getByRole('button', { name: '其他行业', exact: true }).click();
  for (const name of nonMetalNames) {
    await expect(directory.getByRole('rowheader', { name, exact: true })).toBeVisible();
  }
  await directory.getByRole('button', { name: '金属材料', exact: true }).click();
  for (const name of nonMetalNames) {
    await expect(directory.getByRole('rowheader', { name, exact: true })).toHaveCount(0);
  }
  await directory.screenshot({ path: testInfo.outputPath('industry-metal.png') });
  await directory.getByRole('button', { name: '全部行业', exact: true }).click();
  await directory
    .getByRole('button', { name: `展开全部 ${partners.length} 家合作单位`, exact: true })
    .click();
  await expect(directory.locator('tbody tr:visible')).toHaveCount(partners.length);
  expect(
    await directory.locator('tbody tr').evaluateAll((rows) =>
      rows.map((row) => ({
        name: row.querySelector('th')?.textContent,
        industry: row.querySelector('td')?.textContent || null,
      })),
    ),
  ).toEqual(partners.map((partner) => ({ name: partner.fullName, industry: partner.industry })));
});

test('mobile keyboard deletion and reset restore the unfiltered list', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/zh/partner', { waitUntil: 'networkidle' });
  await expect(page.locator('.suneng-map')).toHaveAttribute('data-enhanced', 'true');
  const province = page.getByRole('combobox', { name: '查看省份', exact: true });
  await province.selectOption('320000');
  await expect(page.locator('details[open] [data-partner-id]')).toHaveCount(jiangsu.length);
  await province.selectOption('unassigned');
  await expect(page.locator('details[open] [data-partner-id]')).toHaveCount(pending.length);
  await page.getByRole('button', { name: '关闭所在地待补充合作伙伴', exact: true }).click();
  const directory = page.locator('[data-partner-directory]');
  const search = directory.getByRole('searchbox', { name: '搜索行业名单', exact: true });
  await directory.getByRole('button', { name: '机械与装备', exact: true }).click();
  await search.fill('宁夏长兴');
  await expect(directory.locator('tbody tr:visible')).toHaveCount(1);
  await expect(
    directory.getByRole('rowheader', { name: '宁夏长兴精密机械有限公司', exact: true }),
  ).toBeVisible();
  await search.press('ControlOrMeta+A');
  await search.press('Backspace');
  await expect(search).toHaveValue('');
  await expect(directory.getByRole('status')).not.toContainText('· 1 家');
  await directory.getByRole('button', { name: '其他行业', exact: true }).click();
  for (const name of nonMetalNames) {
    await expect(directory.getByRole('rowheader', { name, exact: true })).toBeVisible();
  }
  await search.fill('没有这家公司123');
  await expect(directory.locator('tbody tr')).toHaveCount(0);
  await directory.getByRole('button', { name: '清除筛选，查看全部客户', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(directory.getByRole('status')).toHaveText(
    `全部行业 · ${partners.length} 家合作单位`,
  );
  await page.screenshot({
    path: testInfo.outputPath(
      testInfo.title.includes('mobile') ? 'mobile-reset.png' : 'desktop-closed.png',
    ),
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  expect(errors).toEqual([]);
});
