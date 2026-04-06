"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface RichTextViewerProps {
  value?: string;
}

export function RichTextViewer({ value }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: false,
    immediatelyRender: false, // Fix for SSR hydration mismatch
  });

  // Update editor content when value changes
  if (editor && value !== undefined) {
    try {
      const json = JSON.parse(value);
      if (JSON.stringify(editor.getJSON()) !== JSON.stringify(json)) {
        editor.commands.setContent(json);
      }
    } catch {
      // If not valid JSON, treat as plain text
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value);
      }
    }
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <EditorContent
        editor={editor}
        className="text-slate-900 dark:text-slate-100"
      />
    </div>
  );
}
