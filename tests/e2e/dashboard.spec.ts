import { test, expect } from '@playwright/test';

test('Integration: Dashboard Hydration and Live State Mutations', async ({ page }) => {
  // 1. Hit the real local compiled Next.js Server
  await page.goto('/');

  // 2. Verify the DOM actually hydrated the Zustand state and rendered Tailwind
  await expect(page.locator('h1')).toContainText('Kalshi');
  
  // 3. Verify the Kill Switch button inherently exists
  const killSwitch = page.locator('button', { hasText: 'Kill Switch' });
  await expect(killSwitch).toBeVisible();

  // 4. Test physical interactivity (Zustand state mutation through UI)
  const botButton = page.locator('button', { hasText: 'Pause' });
  await expect(botButton).toBeVisible();
  
  // Click pause
  await botButton.click();
  // State should mutate to "Resume"
  const resumeButton = page.locator('button', { hasText: 'Resume' });
  await expect(resumeButton).toBeVisible();
});
