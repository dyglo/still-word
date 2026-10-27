export type Block =
  | { type: "p"; html: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src?: string; caption?: string; color?: string };

export type Post = {
  slug: string;
  title: string;
  lede: string;
  category: string;
  date: string; // display date, e.g. "12.7"
  readMinutes: number;
  coverColor: string; // swap for a real coverImage URL later
  author: { name: string; role: string; initials: string };
  blocks: Block[];
};

const author = { name: "Anna Heidki", role: "Journalist & Futurist, The Daily Ledger", initials: "AH" };

const blocks: Block[] = [
  { type: "p", html: "A thesis is a claim that has to be proven. The author states it, and the reader decides whether it holds. <strong>Reading slowly is how that decision gets made well</strong>, because a claim you skimmed is a claim you never really tested." },
  { type: "p", html: "Most of what we read online is scanned, not read. We hunt for the <em>point</em> and leave before the argument arrives." },
  { type: "h2", text: "Three habits worth keeping" },
  { type: "ul", items: ["Read once for the shape, once for the detail.", "Write the claim in one sentence before you agree with it.", "Leave a reply only after a night's sleep."] },
  { type: "quote", text: "Attention is the rarest form of generosity.", cite: "[Author]" },
  { type: "image", color: "#a8431c", caption: "Caption: a photograph from the essay." },
  { type: "p", html: "That is the whole case. Slow down, and the page starts to talk back." },
];

const make = (slug: string, title: string, category: string, date: string, readMinutes: number, coverColor: string): Post => ({
  slug, title, category, date, readMinutes, coverColor, author, blocks,
  lede: "A short argument that attention, not information, is the scarce resource.",
});

export const posts: Post[] = [
  make("the-case-for-slow-reading", "The Case for Slow Reading", "Essays", "12.7", 6, "#5f8a95"),
  make("notes-on-quiet-interfaces", "Notes on Quiet Interfaces", "Design", "28.6", 5, "#b98d5a"),
  make("why-we-still-write-letters", "Why We Still Write Letters", "Essays", "14.6", 4, "#d9d9d9"),
  make("a-small-theory-of-margins", "A Small Theory of Margins", "Typography", "02.6", 7, "#e4e4e4"),
  make("typography-is-tone", "Typography Is Tone", "Typography", "20.5", 3, "#ececec"),
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
