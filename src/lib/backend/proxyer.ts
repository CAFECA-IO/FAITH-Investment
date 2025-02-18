import { NextRequest, NextResponse } from "next/server";

interface IRequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

const proxy = async (req: NextRequest) => {
  // Info: (20250218- Luphia) 取得 method, headers, body, uri 等資訊
  const { method, headers, url } = req;
  const body = await req.text();
  const path = new URL(url).pathname;
  const headersJson = {
    'Content-Type': headers.get('content-type') || 'application/json',
    'User-Agent': headers.get('user-agent') || 'FAITH/1.0.0',
  };
  const target = new URL(path, 'http://127.0.0.1:11434').toString();

  // Info: (20250218- Luphia) 轉發請求
  const requestOptions: IRequestOptions = {
    method,
    headers: headersJson,
    body,
  };
  if(method === 'GET' || method === 'HEAD' || method == 'TRACE') delete requestOptions.body;

  const response = await fetch(target, requestOptions);

  // Info: (20250218- Luphia) 轉發回應，回應內容可能為串流或 JSON
  if (response.body && typeof response.body.getReader === 'function') {
    // Info: (20250218- Luphia) 回應內容為串流，逐步讀取串流內容
    console.log('Stream response');
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

    const responseResult = new NextResponse(readable, {
      headers: response.headers
    });
    return responseResult;
  } else {
    console.log('JSON response');
    const responseResult = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    return responseResult;
  }
}

export default proxy;
