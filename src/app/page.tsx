import { redirect } from 'next/navigation';

export default function Page() {
  // 立即在服務器端重定向到 /chat
  redirect('/chat');
}
