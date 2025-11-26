import { Page } from 'playwright';

export class DropdownFiller {
  /**
   * Fill a dropdown field (native or custom)
   */
  async fill(page: Page, selector: string, value: string): Promise<boolean> {
    try {
      const element = await page.$(selector);
      if (!element) {
        console.log(`  ⚠️  Element not found: ${selector}`);
        return false;
      }

      const tagName = await element.evaluate(el => el.tagName.toLowerCase());

      if (tagName === 'select') {
        return await this.fillNativeSelect(page, selector, value);
      } else {
        return await this.fillCustomDropdown(page, selector, value);
      }
    } catch (error: any) {
      console.log(`  ❌ Dropdown fill failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Fill native <select> element
   */
  private async fillNativeSelect(page: Page, selector: string, value: string): Promise<boolean> {
    try {
      // Scroll into view
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      // Try selecting by label (most common)
      try {
        await page.selectOption(selector, { label: value });
        console.log(`  ✓ Selected by label: ${value}`);
        return true;
      } catch {}

      // Try selecting by value
      try {
        await page.selectOption(selector, { value });
        console.log(`  ✓ Selected by value: ${value}`);
        return true;
      } catch {}

      // Try partial match on label
      const options = await page.$$(`${selector} option`);
      for (const option of options) {
        const optionText = await option.textContent();
        if (optionText?.toLowerCase().includes(value.toLowerCase())) {
          const optionValue = await option.getAttribute('value');
          if (optionValue) {
            await page.selectOption(selector, { value: optionValue });
            console.log(`  ✓ Selected by partial match: ${optionText}`);
            return true;
          }
        }
      }

      console.log(`  ⚠️  No matching option found for: ${value}`);
      return false;
    } catch (error: any) {
      console.log(`  ❌ Native select failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Fill custom dropdown (non-native)
   */
  private async fillCustomDropdown(page: Page, selector: string, value: string): Promise<boolean> {
    try {
      // Scroll into view
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      // Click to open dropdown
      await page.click(selector);
      await page.waitForTimeout(500); // Wait for dropdown to open

      // Try multiple strategies to find and click the option

      // Strategy 1: Find by exact text
      try {
        await page.click(`text="${value}"`, { timeout: 2000 });
        console.log(`  ✓ Clicked option by exact text: ${value}`);
        await page.waitForTimeout(300);
        return true;
      } catch {}

      // Strategy 2: Find by partial text (case-insensitive)
      try {
        const options = await page.$$('[role="option"], [role="menuitem"], li, .option, .dropdown-item');
        for (const option of options) {
          const text = await option.textContent();
          if (text?.toLowerCase().includes(value.toLowerCase())) {
            await option.click();
            console.log(`  ✓ Clicked option by partial match: ${text}`);
            await page.waitForTimeout(300);
            return true;
          }
        }
      } catch {}

      // Strategy 3: Type to search (for searchable dropdowns)
      try {
        await page.type(selector, value);
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter');
        console.log(`  ✓ Typed and pressed Enter: ${value}`);
        await page.waitForTimeout(300);
        return true;
      } catch {}

      // Strategy 4: Find input inside dropdown and type
      try {
        const input = await page.$(`${selector} input, input[aria-expanded="true"]`);
        if (input) {
          await input.type(value);
          await page.waitForTimeout(500);
          await page.keyboard.press('Enter');
          console.log(`  ✓ Typed in dropdown input: ${value}`);
          await page.waitForTimeout(300);
          return true;
        }
      } catch {}

      console.log(`  ⚠️  Could not select custom dropdown option: ${value}`);
      
      // Close dropdown by clicking elsewhere
      try {
        await page.keyboard.press('Escape');
      } catch {}
      
      return false;
    } catch (error: any) {
      console.log(`  ❌ Custom dropdown failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Detect if element is a custom dropdown
   */
  async isCustomDropdown(page: Page, selector: string): Promise<boolean> {
    try {
      const element = await page.$(selector);
      if (!element) return false;

      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      
      // If it's a select, it's native
      if (tagName === 'select') return false;

      // Check for common custom dropdown attributes
      const hasDropdownRole = await element.evaluate(el => 
        el.getAttribute('role') === 'combobox' ||
        el.getAttribute('role') === 'listbox' ||
        el.getAttribute('aria-haspopup') === 'listbox' ||
        el.getAttribute('aria-haspopup') === 'menu'
      );

      return hasDropdownRole;
    } catch {
      return false;
    }
  }
}
