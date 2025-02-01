import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 正規表現で `wrld_` から始まるワールドID を抽出
    const match = url.match(/wrld_[a-zA-Z0-9-]+/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid VRChat world URL" },
        { status: 400 }
      );
    }

    const worldId = match[0];
    const apiUrl = `https://vrchat.com/api/1/worlds/${worldId}`;

    // VRChat API へリクエスト
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch world data", status_code: res.status },
        { status: 400 }
      );
    }

    const data = await res.json();

    // 必要な情報を抽出
    const meta = {
      name: data.name || "",
      description: data.description || "",
      imageUrl: data.imageUrl || "",
    };

    return NextResponse.json(meta);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
