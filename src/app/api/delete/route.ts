import proxy from "@/lib/backend/proxyer";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  return proxy(req);
}
