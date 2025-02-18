import proxy from "@/lib/backend/proxyer";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return proxy(req);
}
