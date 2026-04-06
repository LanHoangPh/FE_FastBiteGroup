"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";

interface RichTextEditorProps {
  value?: string;
  onChange?: (json: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onCharacterLimitExceeded?: (currentLength: number, maxLength: number) => void;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  maxLength = 2000,
  onCharacterLimitExceeded,
}: RichTextEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: value || "",
    immediatelyRender: false, // Fix for SSR hydration mismatch
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const textContent = editor.getText();

      // Update character count
      setCharacterCount(textContent.length);

      // Check character limit
      if (maxLength && textContent.length > maxLength) {
        onCharacterLimitExceeded?.(textContent.length, maxLength);
      }

      onChange?.(JSON.stringify(json));
    },
  });

  // Update editor content when value changes
  useEffect(() => {
    if (
      editor &&
      value !== undefined &&
      value !== JSON.stringify(editor.getJSON())
    ) {
      try {
        const parsed = JSON.parse(value);
        editor.commands.setContent(parsed);
        // Update character count after setting content
        const textContent = editor.getText();
        setCharacterCount(textContent.length);
      } catch {
        editor.commands.setContent(value);
        setCharacterCount(value.length);
      }
    }
  }, [value, editor]);

  // Reset character count when editor is destroyed
  useEffect(() => {
    return () => {
      setCharacterCount(0);
    };
  }, []);

  const insertHeading = useCallback(
    (level: 1 | 2 | 3) => {
      if (!editor) return;
      editor.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const setTextAlign = useCallback(
    (align: "left" | "center" | "right" | "justify") => {
      if (!editor) return;
      editor.chain().focus().setTextAlign(align).run();
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  const isHeadingActive = (level: number) =>
    editor.isActive("heading", { level });
  const isTextAlignActive = (align: string) =>
    editor.isActive({ textAlign: align });

  return (
    <div
      className={cn(
        "border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden",
        className
      )}
      onClick={() => editor?.chain().focus().run()} // Add this to focus editor when container is clicked
    >
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={
            editor.isActive("underline") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(1)}
          className={isHeadingActive(1) ? "bg-slate-200 dark:bg-slate-700" : ""}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          className={isHeadingActive(2) ? "bg-slate-200 dark:bg-slate-700" : ""}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(3)}
          className={isHeadingActive(3) ? "bg-slate-200 dark:bg-slate-700" : ""}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList")
              ? "bg-slate-200 dark:bg-slate-700"
              : ""
          }
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList")
              ? "bg-slate-200 dark:bg-slate-700"
              : ""
          }
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTextAlign("left")}
          className={
            isTextAlignActive("left") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTextAlign("center")}
          className={
            isTextAlignActive("center") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTextAlign("right")}
          className={
            isTextAlignActive("right") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTextAlign("justify")}
          className={
            isTextAlignActive("justify") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Align Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

        {/* Other */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={
            editor.isActive("link") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={
            editor.isActive("blockquote")
              ? "bg-slate-200 dark:bg-slate-700"
              : ""
          }
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={
            editor.isActive("code") ? "bg-slate-200 dark:bg-slate-700" : ""
          }
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[120px] p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 prose prose-slate dark:prose-invert max-w-none focus:outline-none cursor-text"
        style={{ minHeight: "120px" }}
      />

      {/* Character count display */}
      <div className="px-3 py-2 text-right text-xs border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <span
          className={cn(
            "font-medium",
            characterCount > maxLength
              ? "text-red-500"
              : characterCount > maxLength * 0.8
              ? "text-amber-500"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          {characterCount}/{maxLength} ký tự
        </span>
      </div>
    </div>
  );
}
