import { name, version } from '@/package';

export async function GET() {
  const powerby = `${name}/v${version}`;
  const result = {
    powerby,
    name,
    version
  }
  const response = new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
}
