import { Bookmark as Icon } from "lucide-react";
import { useState } from "react";
import { safeStorage } from "@/lib/storage";

export function Bookmark({ id, title }: { id: string; title: string }) {
  const key = "x1-bookmark:" + id;
  const [saved, setSaved] = useState(() => safeStorage.get(key) === "1");
  return (
    <button
      className="bookmark"
      aria-label={`${saved ? "Remove bookmark for" : "Bookmark"} ${title}`}
      aria-pressed={saved}
      onClick={() => {
        if (saved) safeStorage.remove(key);
        else safeStorage.set(key, "1");
        setSaved(!saved);
      }}
    >
      <Icon size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
