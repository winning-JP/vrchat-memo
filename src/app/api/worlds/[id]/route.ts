import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// VRChat API から world のメタデータを取得する関数
async function fetchWorldData(worldId: string) {
  try {
    const apiUrl = `https://vrchat.com/api/1/worlds/${worldId}`;
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.",
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch world data:", res.status);
      return null;
    }

    const data = await res.json();
    return {
      imageUrl: data.imageUrl || data.thumbnailImageUrl || null, // 正しいOG画像の取得
    };
  } catch (error) {
    console.error("Error fetching world data:", error);
    return null;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const worldId = parseInt(resolvedParams.id, 10);
  if (isNaN(worldId)) {
    return NextResponse.json({ error: "Invalid world id" }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    include: { user: true, tags: true },
  });
  if (!world || world.user.email !== session.user.email) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }
  const body = await request.json();
  const { name, url, memo, tags } = body;

  let ogImage = null;
  if (url) {
    const match = url.match(/wrld_[a-zA-Z0-9-]+/);
    if (match) {
      const worldData = await fetchWorldData(match[0]);
      ogImage = worldData?.imageUrl || null;
    }
  }

  const updatedWorld = await prisma.world.update({
    where: { id: worldId },
    data: {
      name,
      url,
      memo,
      ogImage,
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
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const worldId = parseInt(resolvedParams.id, 10);
  if (isNaN(worldId)) {
    return NextResponse.json({ error: "Invalid world id" }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    include: { user: true },
  });
  if (!world || world.user.email !== session.user.email) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }
  await prisma.world.delete({ where: { id: worldId } });
  return new NextResponse(null, { status: 204 });
}
