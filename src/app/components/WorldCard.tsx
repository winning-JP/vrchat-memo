"use client";

import TagInput from "./TagInput";

export type OnEditChangeType = (
  field: "start" | "name" | "url" | "memo" | "ogImage" | "tags",
  value: string | number | string[]
) => void;

interface World {
  id: number;
  name: string;
  url: string;
  memo?: string;
  ogImage?: string;
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
              <label className="form-label">World Name</label>
              <input
                type="text"
                className="form-control"
                value={editData.name}
                onChange={(e) => onEditChange("name", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">World URL</label>
              <input
                type="text"
                className="form-control"
                value={editData.url}
                onChange={(e) => onEditChange("url", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Memo</label>
              <textarea
                className="form-control"
                rows={3}
                value={editData.memo}
                onChange={(e) => onEditChange("memo", e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">OG Image URL</label>
              <input
                type="text"
                className="form-control"
                value={editData.ogImage}
                onChange={(e) => onEditChange("ogImage", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Tags</label>
              <TagInput
                tags={editData.tags}
                onChange={(tags) => onEditChange("tags", tags)}
              />
            </div>
            <button className="btn btn-success me-2" onClick={onSave}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
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
                <img
                  src={world.ogImage}
                  alt="OG Image"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}
            {world.memo && (
              <p className="card-text">Memo: {world.memo}</p>
            )}
            {world.tags && world.tags.length > 0 && (
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
                className="btn btn-warning me-2"
                onClick={() => onEditChange("start", world.id)}
              >
                Edit
              </button>
              <button className="btn btn-danger" onClick={onDelete}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
