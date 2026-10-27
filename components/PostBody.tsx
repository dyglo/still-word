import type { Block } from "@/lib/posts";

// html in "p" blocks comes from the admin editor: sanitize on the server before storing.
export default function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <article className="prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p": return <p key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
          case "h2": return <h2 key={i}>{b.text}</h2>;
          case "ul": return <ul key={i}>{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
          case "quote": return <blockquote key={i}>“{b.text}”{b.cite && <footer>{b.cite}</footer>}</blockquote>;
          case "image":
            return (
              <figure key={i}>
                {b.src ? <img src={b.src} alt={b.caption ?? ""} /> : <div className="ph" style={{ background: b.color }} />}
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </article>
  );
}
