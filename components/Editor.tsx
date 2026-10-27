"use client";

import { useState } from "react";
import { EditorContent, BubbleMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

export default function Editor() {
  const [title, setTitle] = useState("");
  const [lede, setLede] = useState("");
  const [cover, setCover] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Type, or paste text and images straight in…" }),
    ],
    editorProps: {
      // Paste an image from the clipboard, like Google Docs.
      // TODO(backend): upload the file to storage and insert the returned URL instead of a data URL.
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const node = view.state.schema.nodes.image.create({ src: reader.result as string });
            view.dispatch(view.state.tr.replaceSelectionWith(node));
          };
          reader.readAsDataURL(file);
        });
        return true;
      },
    },
  });

  const onCover = (file?: File) => file && setCover(URL.createObjectURL(file));

  const publish = () => {
    // TODO(backend): POST /api/posts { title, lede, cover, html }
    console.log({ title, lede, html: editor?.getHTML() });
  };

  return (
    <div className="ed">
      <div className="ed-bar">
        <a href="/admin/dashboard">← Dashboard</a>
        <button type="button" className="btn" onClick={publish}>Publish</button>
      </div>

      <label className="cover">
        {cover ? <img src={cover} alt="Thumbnail cover" /> : <span><b>Add thumbnail cover</b><br />Shown on the blog grid</span>}
        <input type="file" accept="image/*" hidden onChange={(e) => onCover(e.target.files?.[0])} />
      </label>

      <label htmlFor="headline" className="eyebrow">Headline</label>
      <input id="headline" className="headline" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
      <label htmlFor="lede" className="eyebrow">Lede</label>
      <input id="lede" className="lede-in" value={lede} onChange={(e) => setLede(e.target.value)} placeholder="One sentence summary" />

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bubble" role="toolbar" aria-label="Text formatting">
          <button type="button" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
          <button type="button" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
          <button type="button" aria-label="Underline" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
          <span className="sep" />
          <button type="button" aria-label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}>⟸</button>
          <button type="button" aria-label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}>↔</button>
          <button type="button" aria-label="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}>⟹</button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="prose editor-body" />
    </div>
  );
}
