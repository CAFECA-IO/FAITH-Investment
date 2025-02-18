import proxy from "@/lib/backend/proxyer";
import { NextRequest } from "next/server";

export async function HEAD(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}
