import { NextRequest, NextResponse } from 'next/server';

interface IChatRoom {
  messages: IMessage[];
}

interface IMessage {
  role: string;
  content: string;
}

const chatRooms: {
  [roomId: string]: IChatRoom;
} = {};

export async function POST(req: NextRequest, params: { roomId: string }) {
  try {
    const { roomId } = params;
    const { prompt, model } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: '缺少 prompt 参数' }, { status: 400 });
    }

    const message = {
      "role": "user",
      "content": prompt
    };
    
    chatRooms[roomId] = chatRooms[roomId] || { messages: [] };
    chatRooms[roomId].messages.push(message);
    const messages = chatRooms[roomId].messages;

    // 以串流方式串接 Ollama 服務的回覆
    const query = {
      model: model || "llama3.2:3b",
      messages,
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
    let responseMessageContent = '';

    // 逐步讀取串流內容，並透過 writer 寫入串流
    async function pump() {
      const { done, value } = await reader.read();
      if (done) {
        writer.close();
        // 串流結束後，將回覆內容加入聊天室
        const responseMessage = {
          "role": "assistant",
          "content": responseMessageContent
        };
        chatRooms[roomId].messages.push(responseMessage);
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      await writer.write(chunk);
      pump();
      const partialMessage = JSON.parse(chunk)?.message?.content;
      responseMessageContent += partialMessage;
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
