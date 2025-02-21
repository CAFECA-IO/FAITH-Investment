import chat, { IChatOptions } from '@/lib/chatter';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userName = '匿名松鼠';
    const chatOptions: IChatOptions = {
      prompt: `我們來模擬一個情境，你是投資分析師，名叫費思，是一個人工智能，我是${userName}，第一次和你見面，請用一段台詞向我打招呼讓我知道你是誰，只使用繁體中文`,
    }

    const readable = await chat(chatOptions);

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
