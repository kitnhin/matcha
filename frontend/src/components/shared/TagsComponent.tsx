import { useState } from "react";
import "../../App.css";

interface TagsComponentProps {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagsComponent: React.FC<TagsComponentProps> = ({ selectedTags, setSelectedTags }) => {

    const AVAILABLE_TAGS = [
        "vegan",
        "geek",
        "piercing",
        "gaming",
        "anime",
        "sports",
      ];

      function toggleTag(tag: string) {
        if (selectedTags.includes(tag)) {
          setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
          setSelectedTags([...selectedTags, tag]);
        }
      }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xl font-medium text-gray-700">Tags</label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_TAGS.map((tag) => {
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-md border px-3 py-1 text-sm ${
                selectedTags.includes(tag)
                  ? "bg-gray-500 text-white"
                  : "bg-white"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagsComponent;
