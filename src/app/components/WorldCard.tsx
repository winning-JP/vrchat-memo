"use client";

import Image from "next/image";
import TagInput from "./TagInput";

export type OnEditChangeType = (
  field: "start" | "name" | "url" | "memo" | "tags",
  value: string | number | string[]
) => void;

interface World {
  id: number;
  name: string;
  url: string;
  memo?: string;
  ogImage?: string;
  description?: string;
  tags: { id: number; name: string }[];
}

interface WorldCardProps {
  world: World;
  isEditing: boolean;
  editData: {
    name: string;
    url: string;
    memo: string;
    ogImage: string;
    tags: string[];
  } | null;
  onEditChange: OnEditChangeType;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function WorldCard({
  world,
  isEditing,
  editData,
  onEditChange,
  onSave,
  onCancel,
  onDelete,
}: WorldCardProps) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        {isEditing && editData ? (
          <div>
            <div className="mb-3">
              <label className="form-label">ワールド名</label>
              <input
                type="text"
                className="form-control"
                value={editData.name}
                onChange={(e) => onEditChange("name", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">ワールドURL</label>
              <input
                type="text"
                className="form-control"
                value={editData.url}
                onChange={(e) => onEditChange("url", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">メモ</label>
              <textarea
                className="form-control"
                rows={3}
                value={editData.memo}
                onChange={(e) => onEditChange("memo", e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">タグ</label>
              <TagInput
                tags={editData.tags}
                onChange={(tags) => onEditChange("tags", tags)}
              />
            </div>
            <button className="btn btn-success mr-2" onClick={onSave}>
              保存
            </button>
            <button className="btn btn-secondary" onClick={onCancel}>
              キャンセル
            </button>
          </div>
        ) : (
          <div>
            <h5 className="card-title">{world.name}</h5>
            <p className="card-text">
              URL:{" "}
              <a href={world.url} target="_blank" rel="noopener noreferrer">
                {world.url}
              </a>
            </p>
            {world.ogImage && (
              <div className="mb-3">
                <Image
                  src={world.ogImage}
                  alt={world.name}
                  width={480}
                  height={320}
                  className="og-image"
                  unoptimized
                />
              </div>
            )}
            {world.description && (
              <p className="card-text">説明: {world.description}</p>
            )}
            {world.memo && <p className="card-text">メモ: {world.memo}</p>}
            {world.tags.length > 0 && (
              <div>
                {world.tags.map((tag) => (
                  <span key={tag.id} className="badge bg-secondary me-1">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3">
              <button
                className="btn btn-warning mr-2"
                onClick={() => onEditChange("start", Number(world.id))}
              >
                編集
              </button>
              <button className="btn btn-danger" onClick={onDelete}>
                削除
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
