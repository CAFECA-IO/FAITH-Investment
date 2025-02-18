"use client"

import { useState, useEffect, useRef } from 'react';
import { CSSProperties } from 'react';

export default function Chat() {
  interface Message {
    sender: string;
    text: string;
  }

  const [messages, setMessages] = useState<Message[]>([{ sender: 'faith', text: '我是費思，值得信任的人工智能會計師' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 內容更新後捲動至頁面尾端
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 加入用戶發言紀錄
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);
    setCurrentResponse('');

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.body) {
        // 如果不支持串流，直接解析 JSON
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { sender: 'faith', text: data.output || data.error || '我斷線了' },
        ]);
      } else {
        // 預先加入一筆空回覆內容，後續會逐步更新之
        setMessages((prev) => [...prev, { sender: 'faith', text: '' }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let resultText = '';

        // 逐步讀取輸出文字串流
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
          try {
            const message = JSON.parse(chunk)?.message?.content;
            resultText += message;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (ignore) {
            // 忽略解析錯誤
          }
          setCurrentResponse(resultText);
          // 將串流內容串接至最後一筆對話內容
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { sender: 'faith', text: resultText };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: 'faith', text: '我無法回答這個問題，我們換個話題試試' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div ref={chatContainerRef} style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.bubble,
                backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#fff',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && !currentResponse && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.bubble, fontStyle: 'italic' }}>
              思考中...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="請輸入消息"
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          送出
        </button>
      </form>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #ccc',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '1rem',
  },
  bubble: {
    color: '#333',
    maxWidth: '70%',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
  },
  inputForm: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #ccc',
  },
  input: {
    color: '#333',
    flex: 1,
    padding: '0.5rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    borderRadius: '20px',
    border: '1px solid #ccc',
    marginRight: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};
