import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: '缺少 prompt 参数' }, { status: 400 });
    }

    // 以串流方式串接 Ollama 服務的回覆
    const query = {
      "model": "llama3.2:3b",
      "messages": [
          {
              "role": "user",
              "content": prompt
          }
      ]
    };
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });

    if (!response.ok || !response.body) {
      throw new Error('我出錯了');
    }

    // 建立一個 TransformStream 來串接 Ollama 服務的回覆
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // 逐步讀取串流內容，並透過 writer 寫入串流
    async function pump() {
      const { done, value } = await reader.read();
      if (done) {
        writer.close();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      await writer.write(chunk);
      pump();
    }
    pump();

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('AI 秀逗了：', error);
    return NextResponse.json({ error: 'AI 秀逗了' }, { status: 500 });
  }
}
