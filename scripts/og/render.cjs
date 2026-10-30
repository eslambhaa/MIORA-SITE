// Renders scripts/og/og.html to public/images/og-image.png (1200x630) with Playwright.
// Playwright is not a project dependency: NODE_PATH=$HOME/.claude/skills/gstack/node_modules node scripts/og/render.cjs
const { chromium } = require('playwright')
const path = require('path')

const html = path.join(__dirname, 'og.html')
const out = path.join(__dirname, '..', '..', 'public', 'images', 'og-image.png')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto('file://' + html)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: out })
  await browser.close()
})()
