const aich = 'http://127.0.0.1:11434/api/chat';

interface IAskOptions {
  prompt: string;
  model?: string;
  data?: string[];
}

const ask = async ({ prompt, model, data }: IAskOptions) => {
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

  const reader = queryResponse.body.getReader();
  const decoder = new TextDecoder('utf-8');

  async function pump(prevResult = '') {
    let fullResult;
    const { done, value } = await reader.read();
    const chunk = decoder.decode(value, { stream: true });
    try {
      const jsonData = JSON.parse(chunk);
      const partialResult = jsonData.message.content;
      fullResult = prevResult + partialResult;
    // console.log(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // ignore error
    } finally {
      fullResult = fullResult || prevResult;
      if (!done) return pump(fullResult);
      return fullResult;
    }
  }
  const result = await pump();
  return result;
};

export default ask;
