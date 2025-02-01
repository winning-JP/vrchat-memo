import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

async function fetchWorldData(worldId: string) {
  const apiUrl = `https://vrchat.com/api/1/worlds/${worldId}`;
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
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
    include: { user: true, tags: true },
  });
  if (!existingWorld || existingWorld.user.email !== session.user.email) {
    return NextResponse.json(
      { error: "ワールドが見つかりません" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const {
    name: inputName,
    url,
    memo,
    tags,
    description: inputDescription,
    ogImage: inputOgImage,
  } = body;

  let fetched = null;
  let fetchedOgImage = null;
  let fetchedDescription = existingWorld.description;
  if (url) {
    const match = url.match(/wrld_[a-zA-Z0-9-]+/);
    if (match) {
      fetched = await fetchWorldData(match[0]);
      if (fetched) {
        fetchedOgImage = fetched.imageUrl;
        fetchedDescription = fetched.description;
      }
    }
  }

  const finalName =
    inputName && inputName.trim() !== ""
      ? inputName
      : fetched
      ? fetched.name
      : existingWorld.name;
  const finalDescription =
    inputDescription && inputDescription.trim() !== ""
      ? inputDescription
      : fetchedDescription;
  const finalOgImage =
    inputOgImage && inputOgImage.trim() !== "" ? inputOgImage : fetchedOgImage;

  const updatedWorld = await prisma.world.update({
    where: { id: worldIdNumeric },
    data: {
      name: finalName,
      url,
      memo,
      description: finalDescription,
      ogImage: finalOgImage,
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
