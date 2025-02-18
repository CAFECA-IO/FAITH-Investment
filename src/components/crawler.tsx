"use client";

import { useEffect, useState } from 'react';

interface FetchPageContentProps {
  targetUrl: string;
}

// https://duckduckgo.com/?q=台積電股價
// https://tw.stock.yahoo.com/quote/2330.TW

export default function FetchPageContent({ targetUrl }: FetchPageContentProps) {
  const [textContent, setTextContent] = useState<string>('');

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/crawl?url=${encodeURIComponent(targetUrl)}`);
        const data = await res.json();

        if (data.text) {
          setTextContent(data.text);
        }
      } catch (error) {
        console.error('取得內容時發生錯誤：', error);
      }
    }
    fetchContent();
  }, [targetUrl]);

  return (
    <div>
      <h2>頁面純文字內容：</h2>
      <pre>{textContent}</pre>
    </div>
  );
}
