"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mark, mergeAttributes } from "@tiptap/core";

export const DESIGN_MARKS = [
  { key: "green",  label: "초록", solid: "#3D6B4F", rgba: "rgba(61,107,79,0.25)"    },
  { key: "amber",  label: "황토", solid: "#C4873A", rgba: "rgba(196,135,58,0.28)"   },
  { key: "blue",   label: "하늘", solid: "#5EA0DC", rgba: "rgba(94,160,220,0.28)"   },
  { key: "pink",   label: "분홍", solid: "#D26478", rgba: "rgba(210,100,120,0.25)"  },
];

export const DesignMark = Mark.create({
  name: "designMark",
  addAttributes() {
    return {
      color: {
        default: "green",
        parseHTML: el => el.getAttribute("data-dm"),
        renderHTML: attrs => ({ "data-dm": attrs.color, class: `dm-${attrs.color}` }),
      },
    };
  },
  parseHTML() { return [{ tag: "span[data-dm]" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", mergeAttributes(HTMLAttributes), 0]; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toggleDesignMark: (attrs: { color: string }) => ({ commands }: { commands: any }) =>
        commands.toggleMark("designMark", attrs),
    };
  },
});

export default function RichTextEditor({ label, value, onChange, maxChars, required, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxChars?: number;
  required?: boolean;
  placeholder?: string;
}) {
  const [dmKey, setDmKey] = useState(DESIGN_MARKS[0].key);

  const editor = useEditor({
    extensions: [StarterKit, DesignMark],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-editor",
        "data-placeholder": placeholder ?? "내용을 입력하세요",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const textLen = editor?.getText().length ?? 0;
  const remaining = maxChars ? maxChars - textLen : null;
  const isWarn = remaining !== null && remaining <= 30;
  const isOver = remaining !== null && remaining < 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label className="label-sm" style={{ marginBottom: 0 }}>
          {label}{required && <span className="required-mark"> *</span>}
        </label>
        {maxChars && (
          <span style={{ fontSize: 11, color: isOver ? "#e05252" : isWarn ? "#C4873A" : "#BBBBBB" }}>
            {textLen} / {maxChars}
          </span>
        )}
      </div>

      <div className="rte-toolbar">
        <button
          type="button"
          className={`rte-btn${editor?.isActive("bold") ? " rte-btn--active" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}
          title="굵게 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`rte-btn${editor?.isActive("italic") ? " rte-btn--active" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}
          title="기울임 (Ctrl+I)"
        >
          <em style={{ fontStyle: "italic" }}>I</em>
        </button>
        <div className="rte-divider" />
        {DESIGN_MARKS.map((m) => (
          <button
            key={m.key}
            type="button"
            className="rte-btn"
            onMouseDown={(e) => {
              e.preventDefault();
              setDmKey(m.key);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor?.chain().focus() as any).toggleDesignMark({ color: m.key }).run();
            }}
            title={`${m.label} 마커`}
            style={{ outline: dmKey === m.key ? `2px solid ${m.solid}` : "none", outlineOffset: 1 }}
          >
            <span style={{
              fontSize: 13, fontWeight: 700,
              backgroundImage: `linear-gradient(transparent 55%, ${m.rgba} 55%)`,
              padding: "0 3px",
            }}>A</span>
          </button>
        ))}
        <div className="rte-divider" />
        {([1, 2, 3] as const).map((level) => (
          <button
            key={level}
            type="button"
            className={`rte-btn${editor?.isActive("heading", { level }) ? " rte-btn--active" : ""}`}
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level }).run(); }}
            title={`제목 ${level}`}
          >
            <span style={{ fontSize: 11, fontWeight: 700 }}>H{level}</span>
          </button>
        ))}
        <button
          type="button"
          className={`rte-btn${editor?.isActive("paragraph") && !editor?.isActive("heading") ? " rte-btn--active" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setParagraph().run(); }}
          title="본문"
        >
          <span style={{ fontSize: 11 }}>¶</span>
        </button>
      </div>

      <EditorContent editor={editor} />

      {isOver && (
        <p className="error-text" style={{ marginTop: 4 }}>
          내용이 너무 깁니다 ({Math.abs(remaining!)}자 초과)
        </p>
      )}
    </div>
  );
}
