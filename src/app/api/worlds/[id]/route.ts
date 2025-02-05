import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "認証されていません" }, { status: 401 });
  }
  const body = await request.json();
  const { name, url, description, memo, ogImage, tags, published } = body;
  const isPublished = typeof published === "boolean" ? published : published === "true";
  
  const updatedWorld = await prisma.world.update({
    where: { id: Number(id) },
    data: {
      name,
      url,
      description,
      memo,
      ogImage,
      published: isPublished,
      tags: {
        set: [],
        connectOrCreate: tags.map((tag: string) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: { tags: true },
  });
  return NextResponse.json(updatedWorld);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const worldIdNumeric = parseInt(resolvedParams.id, 10);

  if (isNaN(worldIdNumeric)) {
    return NextResponse.json(
      { error: "無効なワールドIDです" },
      { status: 400 }
    );
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "認証されていません" }, { status: 401 });
  }
  const existingWorld = await prisma.world.findUnique({
    where: { id: worldIdNumeric },
    include: { user: true },
  });
  if (!existingWorld || existingWorld.user.email !== session.user.email) {
    return NextResponse.json(
      { error: "ワールドが見つかりません" },
      { status: 404 }
    );
  }
  await prisma.world.delete({ where: { id: worldIdNumeric } });
  return new NextResponse(null, { status: 204 });
}
