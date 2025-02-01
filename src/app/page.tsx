"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { useState, useMemo } from "react";
import WorldCard, { OnEditChangeType } from "./components/WorldCard";
import TagInput from "./components/TagInput";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: session, status } = useSession();
  const { data: worlds, mutate } = useSWR(
    session ? "/api/worlds" : null,
    fetcher
  );
  const { data: allTags } = useSWR("/api/tags", fetcher);

  const [newWorld, setNewWorld] = useState({
    name: "",
    url: "",
    description: "",
    memo: "",
    ogImage: "",
    tags: [] as string[],
  });

  const [editing, setEditing] = useState<{ [id: number]: any }>({});
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const handleCreate = async () => {
    const res = await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWorld),
    });
    if (res.ok) {
      mutate();
      setNewWorld({
        name: "",
        url: "",
        description: "",
        memo: "",
        ogImage: "",
        tags: [],
      });
    }
  };

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

  const createEditChangeHandler = (worldId: number): OnEditChangeType => {
    return (field, value) => {
      setEditing((prev) => ({
        ...prev,
        [worldId]: {
          ...prev[worldId],
          [field]: value,
        },
      }));
    };
  };

  // 新規作成フォーム用：URLから情報取得ボタンの処理
  const handleFetchMetaForNew = async () => {
    if (!newWorld.url) return;
    const res = await fetch("/api/fetchMeta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newWorld.url }),
    });
    if (res.ok) {
      const data = await res.json();
      setNewWorld((prev) => ({
        ...prev,
        name: prev.name.trim() !== "" ? prev.name : data.name,
        description:
          prev.description.trim() !== "" ? prev.description : data.description,
        ogImage: prev.ogImage.trim() !== "" ? prev.ogImage : data.imageUrl,
      }));
    }
  };

  return (
    <div className="container mt-5">
      {status === "loading" ? (
        <div className="text-center">
          <h3>読み込み中...</h3>
        </div>
      ) : !session ? (
        <div className="text-center">
          <h1>VRChat ワールド備忘録</h1>
          <button className="btn btn-primary" onClick={() => signIn()}>
            GitHubでサインイン
          </button>
        </div>
      ) : (
        <>
          <h1 className="mb-4">VRChat ワールド備忘録</h1>
          <button className="btn btn-secondary mb-4" onClick={() => signOut()}>
            サインアウト
          </button>

          <section className="mb-5">
            <h2>新規ワールド作成</h2>
            <div className="mb-3">
              <label className="form-label">ワールドURL</label>
              <input
                type="text"
                className="form-control"
                placeholder="ワールドのURLを入力してください （https://vrchat.com/home/world/wrld_12345abc）"
                value={newWorld.url}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, url: e.target.value })
                }
              />
            </div>
            <button
              className="btn btn-info mb-3"
              onClick={handleFetchMetaForNew}
            >
              情報取得
            </button>
            <div className="mb-3">
              <label className="form-label">
                ワールド名（自動取得または手動入力）
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="ワールド名（【情報取得】ボタンで自動入力されます）"
                value={newWorld.name}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                説明（自動取得または手動入力）
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="説明（【情報取得】ボタンで自動入力されます）"
                value={newWorld.description}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, description: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">メモ</label>
              <textarea
                className="form-control"
                rows={3}
                value={newWorld.memo}
                onChange={(e) =>
                  setNewWorld({ ...newWorld, memo: e.target.value })
                }
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">タグ</label>
              <TagInput
                tags={newWorld.tags}
                onChange={(tags) => setNewWorld({ ...newWorld, tags })}
              />
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>
              ワールドを追加
            </button>
          </section>

          <section className="mb-4">
            <h2>登録済みワールド</h2>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">タグで絞り込み</label>
                <select
                  className="form-select"
                  value={selectedFilterTag}
                  onChange={(e) => setSelectedFilterTag(e.target.value)}
                >
                  <option value="All">すべて</option>
                  {allTags &&
                    allTags.map((tag: any) => (
                      <option key={tag.id} value={tag.name}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">名前順でソート</label>
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
                  onEditChange={(field, value) => {
                    if (field === "start") {
                      const id = value as number;
                      const targetWorld = worlds.find((w: any) => w.id === id);
                      if (targetWorld) {
                        setEditing((prev) => ({
                          ...prev,
                          [id]: {
                            name: targetWorld.name,
                            url: targetWorld.url,
                            description: targetWorld.description || "",
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
                  }}
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
              <p>ワールドが見つかりません。</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
