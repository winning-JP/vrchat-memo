import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(tags);
}
