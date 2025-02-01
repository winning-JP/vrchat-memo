"use client";

import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const newTag = input.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="mb-2">
        {tags.map((tag) => (
          <span key={tag} className="badge bg-secondary me-1">
            {tag}{" "}
            <button
              type="button"
              className="btn-close btn-close-white btn-sm"
              aria-label="Remove"
              onClick={() => removeTag(tag)}
            ></button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="form-control"
        placeholder="Add tag and press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
