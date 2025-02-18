import puppeteer from "puppeteer";

const crawl = async (url: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const textContent = await page.evaluate(() => document.body.innerText);
  await browser.close();
  return { text: textContent };
}

export default crawl;
