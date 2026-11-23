import { useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

const styles = [
  ["", "Paragraph"],
  ["# ", "Heading"],
  ["## ", "Subheading"],
  ["### ", "Minor heading"],
  ["> ", "Quotation"],
  ["- ", "Bullet"],
  ["1. ", "Numbered item"],
] as const;

// Keep an exact source slice per paragraph. Editing a block never serializes
// its neighbours, which preserves links, fenced code and unfamiliar Markdown.
export function VisualEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const blocks = value.split(/(\n{2,})/);
  function update(index: number, next: string) {
    onChange(blocks.map((part, i) => (i === index ? next : part)).join(""));
  }
  return (
    <div className="visual-editor" aria-label="Visual article editor">
      {blocks.map((part, i) => {
        if (i % 2) return null;
        const prefix = part.match(/^(#{1,3} |[-*>] |\d+\. )/)?.[0] ?? "";
        if (active !== i)
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={"Edit block " + (i / 2 + 1)}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (["Enter", " "].includes(e.key)) {
                  e.preventDefault();
                  setActive(i);
                }
              }}
            >
              {part ? (
                <div
                  className="visual-block-preview"
                  ref={(el) => {
                    if (el) el.inert = true;
                  }}
                >
                  {renderMarkdown(part)}
                </div>
              ) : (
                "Write a paragraph…"
              )}
            </div>
          );
        return (
          <div key={i} className="visual-block">
            <select
              aria-label="Block style"
              value={prefix}
              onChange={(e) =>
                update(i, e.target.value + part.slice(prefix.length))
              }
            >
              {!styles.some(([key]) => key === prefix) && (
                <option value={prefix}>List item</option>
              )}
              {styles.map(([key, label]) => (
                <option key={label} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <textarea
              autoFocus
              aria-label="Block text"
              rows={Math.max(2, part.split("\n").length)}
              value={part.slice(prefix.length)}
              onChange={(e) => update(i, prefix + e.target.value)}
            />
            <button type="button" onClick={() => setActive(null)}>
              Done
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          if (!value) {
            setActive(0);
            return;
          }
          if (/\n{2,}$/.test(value)) {
            setActive(blocks.length - 1);
            return;
          }
          onChange(value + "\n\n");
          setActive(blocks.length + 1);
        }}
      >
        Add paragraph
      </button>
    </div>
  );
}
