import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET() {
  const worlds = await prisma.world.findMany({
    where: { published: true },
    include: { tags: true },
  });
  return NextResponse.json(worlds);
}
