import proxy from "@/lib/backend/proxyer";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return proxy(req);
}
