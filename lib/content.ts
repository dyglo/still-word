import sanitizeHtml from 'sanitize-html';
import { parseDocument, DomUtils } from 'htmlparser2';
import { Element } from 'domhandler';

export function sanitizeContent(html: string) {
  const sanitized = sanitizeHtml(html, {
    allowedTags: ['p', 'h2', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'blockquote', 'img', 'figure', 'figcaption', 'br'],
    allowedAttributes: { '*': ['style'], img: ['src', 'alt', 'title', 'width', 'height'] },
    allowedStyles: { '*': { 'text-align': [/^(left|center|right|justify)$/] } },
    allowedSchemes: ['https'], allowProtocolRelative: false,
    transformTags: {
      img: (_tag, attrs) => ({ tagName: 'img', attribs: { ...attrs, src: /^https:\/\//i.test(attrs.src ?? '') ? attrs.src : '' } }),
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
  });
  // Preserve the approved reading-page image layout for the editor's bare <img> nodes.
  const document = parseDocument(sanitized);
  for (const img of DomUtils.getElementsByTagName('img', document.children, true)) {
    const parent = img.parent;
    if (!parent || (parent instanceof Element && parent.name === 'figure')) continue;
    const figure = new Element('figure', {}, [img]);
    parent.children[parent.children.indexOf(img)] = figure;
    figure.parent = parent;
    img.parent = figure;
  }
  return DomUtils.getOuterHTML(document);
}

export function slugify(title: string) {
  return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 200).replace(/-$/, '') || 'untitled';
}

export function readMinutes(html: string) {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {}, textFilter: text => `${text} ` })
    .replace(/&(?:nbsp|#160|#xa0);/gi, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const signupsOpen = (adminCount: number) => adminCount === 0;

export function isPostImage(value: string | null | undefined) {
  if (!value) return true;
  if (typeof value !== 'string') return false;
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/`;
  return value.startsWith(prefix) && !/[\s"<>]/.test(value);
}
