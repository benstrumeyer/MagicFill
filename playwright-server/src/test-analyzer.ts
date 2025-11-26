import { chromium } from 'playwright';
import { ProfileGenerator } from './ProfileGenerator';

async function test() {
  const testUrl = process.argv[2] || 'https://job-boards.greenhouse.io/trueanomalyinc/jobs/4992058007';
  
  console.log(`\n🧪 Testing analyzer with URL: ${testUrl}\n`);
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto(testUrl, { waitUntil: 'networkidle' });
  
  const generator = new ProfileGenerator();
  const profile = await generator.generate(page, testUrl);
  
  console.log('\n📄 Generated Profile:');
  console.log(JSON.stringify(profile, null, 2));
  
  await browser.close();
}

test().catch(console.error);
