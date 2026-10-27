"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import type { PostRow } from '@/lib/data/posts';
import type { Json } from '@/lib/supabase/database.types';
import { savePost } from '@/app/admin/editor/actions';
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

export default function Editor({ post }: { post?: PostRow }) {
  const router = useRouter();
  const [postId, setPostId] = useState(post?.id);
  const [title, setTitle] = useState(post?.title ?? "");
  const [lede, setLede] = useState(post?.lede ?? "");
  const [cover, setCover] = useState<string | null>(post?.cover_url ?? null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);

  async function upload(file: File) {
    setUploads(n => n + 1);
    try {
      const body = new FormData(); body.set('file', file);
      const response = await fetch('/api/images', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.url as string;
    } finally { setUploads(n => n - 1); }
  }

  const editor = useEditor({
    content: post?.content_json as JSONContent | undefined,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ underline: false, link: false, heading: { levels: [2] }, code: false, codeBlock: false, strike: false, horizontalRule: false }),
      Underline,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Type, or paste text and images straight in…" }),
    ],
    editorProps: {
      // Keep clipboard image insertion; uploaded URLs replace the original data URLs.
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        void (async () => {
          for (const file of files) {
            try {
              const url = await upload(file);
              if (view.isDestroyed) return;
              const node = view.state.schema.nodes.image.create({ src: url });
              view.dispatch(view.state.tr.replaceSelectionWith(node));
            } catch (error) { setMessage(error instanceof Error ? error.message : 'Image upload failed.'); }
          }
        })();
        return true;
      },
    },
  });

  const onCover = async (file?: File) => {
    if (!file) return;
    try { setCover(await upload(file)); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Image upload failed.'); }
  };

  const save = async (status: 'draft' | 'published') => {
    if (!editor || busy || uploads) return;
    setBusy(true); setMessage('');
    try {
      const json = JSON.parse(JSON.stringify(editor.getJSON())) as Json;
      const result = await savePost({ id: postId, title, lede, cover, html: editor.getHTML(), json, status });
      if (result.error) { setMessage(result.error); return; }
      setPostId(result.id);
      setMessage(status === 'published' ? 'Published.' : 'Draft saved.');
      router.replace(`/admin/editor/${result.id}`); router.refresh();
    } catch { setMessage('Could not save. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="ed">
      <div className="ed-bar">
        <a href="/admin/dashboard">← Dashboard</a>
        <button type="button" className="btn" disabled={busy || uploads > 0} onClick={() => save('draft')}>Save draft</button>
        <button type="button" className="btn" disabled={busy || uploads > 0} onClick={() => save('published')}>Publish</button>
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
        <BubbleMenu editor={editor} options={{ placement: 'top' }} className="bubble" role="toolbar" aria-label="Text formatting">
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
      {message && <p className="muted" role="status">{message}</p>}
    </div>
  );
}
