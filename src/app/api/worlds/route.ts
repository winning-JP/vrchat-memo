import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

async function fetchWorldData(worldId: string) {
  const apiUrl = `https://winning.moe/api/vrchat/data/?id=${worldId}`;
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.",
    },
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  return {
    name: data.name || "",
    description: data.description || "",
    imageUrl: data.imageUrl || data.thumbnailImageUrl || null,
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }
  const worlds = await prisma.world.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
    include: { tags: true } // 追加: tags を含める
  });
  return NextResponse.json(worlds);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "認証されていません" }, { status: 401 });
  }
  const body = await request.json();
  const {
    url,
    memo,
    tags,
    name: inputName,
    description: inputDescription,
    ogImage: inputOgImage,
  } = body;

  let fetched = null;
  if (url) {
    const match = url.match(/wrld_[a-zA-Z0-9-]+/);
    if (match) {
      fetched = await fetchWorldData(match[0]);
    }
  }
  if (!fetched) {
    return NextResponse.json(
      { error: "ワールド情報の取得に失敗しました" },
      { status: 400 }
    );
  }

  // 手動入力値があれば優先
  const finalName =
    inputName && inputName.trim() !== "" ? inputName : fetched.name;
  const finalDescription =
    inputDescription && inputDescription.trim() !== ""
      ? inputDescription
      : fetched.description;
  const finalOgImage =
    inputOgImage && inputOgImage.trim() !== ""
      ? inputOgImage
      : fetched.imageUrl;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "ユーザーが見つかりません" },
      { status: 404 }
    );
  }

  const newWorld = await prisma.world.create({
    data: {
      name: finalName,
      url,
      description: finalDescription,
      memo,
      ogImage: finalOgImage,
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
