"use client";

import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onChange([...tags, input.trim()]);
      setInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  return (
    <div>
      <div className="mb-2">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="badge bg-secondary me-1">
            {tag}{" "}
            <button
              type="button"
              className="btn-close btn-close-white btn-sm"
              aria-label="削除"
              onClick={() => handleRemoveTag(index)}
            ></button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="タグを入力し、Enterキーを押してください"
        className="form-control"
      />
    </div>
  );
}
