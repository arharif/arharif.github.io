import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { palettes } from '../src/lib/palettes.ts';
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const origin = process.env.X1_REVIEW_ORIGIN || 'http://127.0.0.1:4174';
const results = [];
const keys = ['--x1-bg','--x1-surface','--x1-text','--x1-accent','--x1-text-muted'];
const page = await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
try {
  for (const [id,[label,bg,surface,ink,accent,,muted]] of Object.entries(palettes)) {
    await page.goto(origin);
    await page.getByLabel('Open theme selector').click();
    await page.getByRole('menuitemradio',{name:'Activate '+label,exact:true}).click();
    const routes = [];
    for (const path of ['/','/insights-innovation','/x1-academic','/about-x1']) {
      await page.goto(origin+path);
      await page.locator('h1').first().waitFor();
      const actual = await page.evaluate(keys=>keys.map(k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim()),keys);
      assert.deepEqual(actual,[bg,surface,ink,accent,muted]);
      routes.push(path);
      if (path === '/') {
        const images = await page.locator('.destination img').evaluateAll(imgs=>Promise.all(imgs.map(async i=>{await i.decode();return i.naturalWidth;})));
        assert.ok(images.length === 3 && images.every(Boolean));
        if (process.env.X1_THEME_CAPTURE_DIR) await page.screenshot({path:process.env.X1_THEME_CAPTURE_DIR+'/'+id+'.jpg',quality:82});
      }
    }
    results.push({id,label,bg,surface,ink,accent,muted,routes});
  }
  await writeFile('docs/elite-review/themes.json',JSON.stringify(results,null,2)+'\n');
} finally { await browser.close(); }
