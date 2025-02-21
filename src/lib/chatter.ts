const aich = 'http://127.0.0.1:11434/api/chat';

export interface IChatOptions {
  prompt: string;
  model?: string;
  data?: string[];
}

const chat = async ({ prompt, model, data }: IChatOptions) => {
  if (prompt.trim() === '') throw new Error('require prompt');

  const queryModel = model || 'llama3.2:3b';
  const messages = data?.map((value) => {
    const message = {
      role: 'user',
      content: `參考這些資料：${value}`,
    };
    return message;
  }) || [];
  const query = {
    model: queryModel,
    messages: [ ...messages,
      {
        role: 'user',
        content: prompt,
      },
    ],
  };
  const queryResponse = await fetch(aich, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!queryResponse.ok) throw new Error('AI response error');
  if (!queryResponse.body) throw new Error('AI no Response');

  // 建立一個 TransformStream 來串接 Ollama 服務的回覆
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = queryResponse.body.getReader();
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
  return readable;
};

export default chat;
