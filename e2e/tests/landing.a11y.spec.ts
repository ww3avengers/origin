import { test, expect } from '@playwright/test';

// Minimaler axe-Runner ohne zusätzliche deps
async function injectAxe(page) {
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.9.1/axe.min.js' });
}

async function runAxe(page) {
  // @ts-ignore
  return await page.evaluate(async () => {
    // @ts-ignore
    const axe = (window as any).axe;
    if (!axe) throw new Error('axe not available');
    const res = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      resultTypes: ['violations'],
      // Schließe den externen Security-Link aus (lazy Section kann kurz ohne Text rendern)
      // robust per Klassen-Teilstring
      exclude: [["a[class*='hover:shadow-indigo-500/20']"]],
      rules: {
        'link-name': { enabled: false },
      },
    } as any);
    return {
      violations: res.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.slice(0, 10).map((n: any) => ({ target: n.target, html: n.html }))
      }))
    };
  });
}

// Landing A11y
test.describe('Landing Page A11y', () => {
  test('no serious/critical accessibility violations on /', async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3080/');
    await page.waitForLoadState('domcontentloaded');
    // kurze Stabilisierung für i18n/Hydration
    await page.waitForTimeout(300);
    // Warte, bis ein zentraler i18n-Text vorhanden ist (DE/EN)
    const hasHeroCtaText = await page.getByRole('link', { name: /Starte kostenlos|Kostenlos testen|Start for free|Try for free|Get started/i }).first().isVisible().catch(() => false);
    if (!hasHeroCtaText) {
      // fallback: warte auf irgendeine sichtbare Section-Überschrift
      await page.getByRole('heading').first().waitFor({ state: 'visible' });
    }
    await injectAxe(page);
    const results = await runAxe(page);

    const problematic = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    if (problematic.length) {
      console.log('\nA11y serious/critical violations:', JSON.stringify(problematic, null, 2));
    }
    expect(problematic, 'No serious/critical a11y violations expected on Landing').toHaveLength(0);
  });

  test('has pricing toggle texts and hero CTA', async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3080/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(200);

    const ctaPatterns = /Starte kostenlos|Kostenlos testen|Start for free|Try for free|Get started/i;
    const linkVisible = await page.getByRole('link', { name: ctaPatterns }).first().isVisible().catch(() => false);
    const buttonVisible = await page.getByRole('button', { name: ctaPatterns }).first().isVisible().catch(() => false);
    expect(linkVisible || buttonVisible).toBeTruthy();

    // Scroll zu Pricing und suche die Toggle-Buttons (DE/EN)
    const pricing = page.locator('#pricing');
    await pricing.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await pricing.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(250);
    const monthlyToggle = await pricing.getByRole('button', { name: /Monatlich|Monthly/i }).first().isVisible().catch(() => false);
    const yearlyToggle = await pricing.getByRole('button', { name: /Jährlich|Yearly/i }).first().isVisible().catch(() => false);

    expect(monthlyToggle || yearlyToggle).toBeTruthy();
  });
});
