import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// 簡易的なOG画像取得関数の例
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
      imageUrl: data.imageUrl || data.thumbnailImageUrl || null,
    };
  } catch (error) {
    console.error("Error fetching world data:", error);
    return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const worlds = await prisma.world.findMany({
    where: { user: { email: session.user.email } },
    include: { tags: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(worlds);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newWorld = await prisma.world.create({
    data: {
      name,
      url,
      memo,
      ogImage,
      user: { connect: { id: user.id } },
      tags: {
        connectOrCreate: tags.map((tag: string) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: { tags: true },
  });

  return NextResponse.json(newWorld, { status: 201 });
}
