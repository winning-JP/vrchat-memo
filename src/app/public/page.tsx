"use client";

import useSWR from "swr";
import WorldCard from "../components/WorldCard";

export interface World {
  id: number;
  name: string;
  url: string;
  description?: string;
  memo?: string;
  ogImage?: string;
  tags: { id: number; name: string }[];
  published: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PublicWorlds() {
  const { data: worlds } = useSWR<World[]>("/api/worlds/public", fetcher);

  return (
    <div className="container mt-5">
      <h1>公開ワールド一覧</h1>
      {worlds && worlds.length > 0 ? (
        worlds.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            isEditing={false}
            editData={null}
            onEditChange={() => {}}
            onSave={() => {}}
            onCancel={() => {}}
            onDelete={() => {}}
            editable={false}
          />
        ))
      ) : (
        <p>公開されているワールドはありません。</p>
      )}
    </div>
  );
}
