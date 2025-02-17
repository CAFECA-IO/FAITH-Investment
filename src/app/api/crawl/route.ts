import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  let browser;
  let snapshot;


  if (!url) {
    return NextResponse.json({ error: '缺少 url 參數' }, { status: 400 });
  }

  try {
    // 啟動 Puppeteer，注意在某些環境中可能需要額外參數
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // 載入目標網頁，等待網路請求穩定
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.screenshot({ fullPage: true, path: './example.png' });
    // snapshot 轉為 base64
    // const snapshot = await page.screenshot({ fullPage: true });
    const snapshot = await page.screenshot({ fullPage: true, encoding: 'base64' });
    return NextResponse.json({ snapshot });

    // 取得頁面內純文字內容（document.body.innerText）
    // const textContent = await page.evaluate(() => document.body.innerText);
    
    // 透過 ollama 摘要內容
    const query = {
      "model": "llama3.2-vision",
      "messages": [
          {
              "role": "user",
              "content": `摘要圖片內容`,
              "images": [snapshot]
          }
      ]
    };
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error('Ollama 呼叫失敗');
    }

    const text = await response.json();
    console.log(text);

    return NextResponse.json({ text });
  } catch (error) {
    console.error('取得頁面內容失敗：', error);
    return NextResponse.json({ error: '無法取得頁面內容', snapshot }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
