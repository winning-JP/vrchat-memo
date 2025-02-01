import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: "URLが指定されていません" },
        { status: 400 }
      );
    }

    const match = url.match(/wrld_[a-zA-Z0-9-]+/);
    if (!match) {
      return NextResponse.json(
        { error: "有効なVRChatワールドURLではありません" },
        { status: 400 }
      );
    }
    const worldId = match[0];
    const apiUrl = `https://winning.moe/api/vrchat/data/?id=${worldId}`;

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.",
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "ワールド情報の取得に失敗しました", status_code: res.status },
        { status: 400 }
      );
    }
    const data = await res.json();
    const meta = {
      name: data.name || "",
      description: data.description || "",
      imageUrl: data.imageUrl || data.thumbnailImageUrl || "",
    };
    return NextResponse.json(meta);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}
