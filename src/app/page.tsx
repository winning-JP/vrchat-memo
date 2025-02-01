"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { useState, useMemo } from "react";
import WorldCard from "./components/WorldCard";
import TagInput from "./components/TagInput";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: session, status } = useSession();
  const { data: worlds, mutate } = useSWR(session ? "/api/worlds" : null, fetcher);
  const { data: allTags } = useSWR("/api/tags", fetcher);

  // 新規登録用の状態
  const [newWorld, setNewWorld] = useState({
    name: "",
    url: "",
    memo: "",
    ogImage: "",
    tags: [] as string[],
  });

  // 編集状態などはここでは割愛（前回の例と同様）
  const [editing, setEditing] = useState<{ [id: number]: any }>({});
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // フィルター＆ソート処理
  const filteredAndSortedWorlds = useMemo(() => {
    if (!worlds) return [];
    let filtered = worlds;
    if (selectedFilterTag !== "All") {
      filtered = filtered.filter((world: any) =>
        world.tags.some((tag: any) => tag.name === selectedFilterTag)
      );
    }
    filtered.sort((a: any, b: any) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    return filtered;
  }, [worlds, selectedFilterTag, sortOrder]);

  // URLからmeta情報を自動取得する関数
  const handleFetchMeta = async () => {
    if (!newWorld.url) return;
    try {
      const res = await fetch("/api/fetchMeta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newWorld.url }),
      });
      if (res.ok) {
        const meta = await res.json();
        // 取得した meta 情報で新規ワールドの各フィールドを補完
        setNewWorld((prev) => ({
          ...prev,
          name: meta.name || prev.name,
          memo: meta.description || prev.memo,
          ogImage: meta.imageUrl || prev.ogImage,
        }));
      } else {
        console.error("Failed to fetch meta information");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 新規作成処理
  const handleCreate = async () => {
    const res = await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWorld),
    });
    if (res.ok) {
      mutate();
      setNewWorld({ name: "", url: "", memo: "", ogImage: "", tags: [] });
    }
  };

  // 編集保存および削除処理は前回の例と同様…
  const handleSaveEdit = async (id: number) => {
    const editData = editing[id];
    const res = await fetch(`/api/worlds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      mutate();
      setEditing((prev) => {
        const newEditing = { ...prev };
        delete newEditing[id];
        return newEditing;
      });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/worlds/${id}`, { method: "DELETE" });
    if (res.ok) {
      mutate();
    }
  };

  // ここではフックの呼び出し順序が変わらないよう、すべてのフックは上部で呼び出しています

  return (
    <div className="container mt-5">
      {status === "loading" ? (
        <div className="text-center">
          <h3>Loading...</h3>
        </div>
      ) : !session ? (
        <div className="text-center">
          <h1>VRChat World Memo</h1>
          <button className="btn btn-primary" onClick={() => signIn()}>
            Sign in with GitHub
          </button>
        </div>
      ) : (
        <>
          <h1 className="mb-4">VRChat World Memo</h1>
          <button className="btn btn-secondary mb-4" onClick={() => signOut()}>
            Sign Out
          </button>

          {/* 新規登録フォーム */}
          <section className="mb-5">
            <h2>Create New World</h2>
            <div className="mb-3">
              <label className="form-label">World URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter world URL"
                value={newWorld.url}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, url: e.target.value })
                }
                onBlur={handleFetchMeta}  // URL入力後に自動でmeta取得
              />
            </div>
            <div className="mb-3">
              <label className="form-label">World Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="World name (auto-filled)"
                value={newWorld.name}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Memo</label>
              <textarea
                className="form-control"
                placeholder="Memo (auto-filled)"
                rows={3}
                value={newWorld.memo}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, memo: e.target.value })
                }
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">OG Image (auto-filled)</label>
              {newWorld.ogImage && (
                <div className="mb-2">
                  <img
                    src={newWorld.ogImage}
                    alt="OG Image"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Tags</label>
              <TagInput
                tags={newWorld.tags}
                onChange={(tags) => setNewWorld({ ...newWorld, tags })}
              />
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>
              Add World
            </button>
          </section>

          {/* フィルターとソート */}
          <section className="mb-4">
            <h2>Your Worlds</h2>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Filter by Tag</label>
                <select
                  className="form-select"
                  value={selectedFilterTag}
                  onChange={(e) => setSelectedFilterTag(e.target.value)}
                >
                  <option value="All">All</option>
                  {allTags &&
                    allTags.map((tag: any) => (
                      <option key={tag.id} value={tag.name}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Sort by Name</label>
                <select
                  className="form-select"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                >
                  <option value="asc">A - Z</option>
                  <option value="desc">Z - A</option>
                </select>
              </div>
            </div>
            {worlds && worlds.length > 0 ? (
              filteredAndSortedWorlds.map((world: any) => (
                <WorldCard
                  key={world.id}
                  world={world}
                  isEditing={!!editing[world.id]}
                  editData={editing[world.id] || null}
                  onEditChange={((field, value) => {
                    if (field === "start") {
                      const id = value as number;
                      const targetWorld = worlds.find((w: any) => w.id === id);
                      if (targetWorld) {
                        setEditing((prev) => ({
                          ...prev,
                          [id]: {
                            name: targetWorld.name,
                            url: targetWorld.url,
                            memo: targetWorld.memo || "",
                            ogImage: targetWorld.ogImage || "",
                            tags: targetWorld.tags.map((tag: any) => tag.name),
                          },
                        }));
                      }
                    } else {
                      setEditing((prev) => ({
                        ...prev,
                        [world.id]: {
                          ...prev[world.id],
                          [field]: value,
                        },
                      }));
                    }
                  }) as (field: "start" | "name" | "url" | "memo" | "ogImage" | "tags", value: string | number | string[]) => void}
                  onSave={() => handleSaveEdit(world.id)}
                  onCancel={() =>
                    setEditing((prev) => {
                      const newEditing = { ...prev };
                      delete newEditing[world.id];
                      return newEditing;
                    })
                  }
                  onDelete={() => handleDelete(world.id)}
                />
              ))
            ) : (
              <p>No worlds found.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
