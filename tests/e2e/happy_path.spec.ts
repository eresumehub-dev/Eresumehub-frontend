import { test, expect } from '@playwright/test';

/**
 * Staff+ E2E Smoke Test: Happy Path (v6.9.0)
 * Verifies the Core Value Proposition: Resume Generation.
 * Ensures the data funnel from input to AI trigger is functional.
 */

test.describe('E-Resume Hub: Core Flows', () => {
  
  test('should allow a user to generate an AI resume', async ({ page }) => {
    // 1. Setup: Local storage tokens if needed (mocked for smoke test)
    // For now, we assume the user is redirected to sign-in or we have a dev bypass.
    // In a real FAANG CI, we use pre-seeded test accounts.
    
    await page.goto('/create-resume');
    
    // 2. Wait for profile sync (loading state)
    await expect(page.locator('text=Synchronizing profile')).toBeHidden({ timeout: 10000 });
    
    // 3. Form Input
    const jobTitleInput = page.getByPlaceholder(/senior frontend engineer/i);
    await jobTitleInput.fill('Staff Software Engineer');
    
    // 4. Verification: Readiness Hub updates
    await expect(page.locator('text=Ready to Launch')).toBeVisible();
    
    // 5. Action: Generate
    const generateBtn = page.getByRole('button', { name: /generate/i });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();
    
    // 6. Verification: Progress Feedbacks
    await expect(page.locator('text=Initializing...')).toBeVisible();
    
    // 7. Final Success: Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
