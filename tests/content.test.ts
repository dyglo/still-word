import { describe, expect, it } from 'vitest';
import { readMinutes, sanitizeContent, signupsOpen, slugify } from '../lib/content';

describe('post content', () => {
  it('creates stable slugs from accents, punctuation and empty titles', () => {
    expect(slugify('  Café — A Quiet Morning! ')).toBe('cafe-a-quiet-morning');
    expect(slugify('---')).toBe('untitled');
    expect(slugify('a'.repeat(400))).toHaveLength(200);
  });
  it('counts reading time from text, excluding HTML and script payloads', () => {
    expect(readMinutes('')).toBe(1);
    expect(readMinutes(`<p>${'word '.repeat(201)}</p><script>${'x '.repeat(1000)}</script>`)).toBe(2);
    expect(readMinutes('<p>word</p>'.repeat(201))).toBe(2);
  });
  it('removes scripts, event handlers, data URLs, dangerous links and CSS', () => {
    const html = sanitizeContent('<script>alert(1)</script><p onclick="bad()" style="position:fixed;text-align:center">Hello <strong>world</strong></p><img src="data:image/svg+xml,bad"><img src="https://example.com/a.png" onerror="bad()"><a href="javascript:bad()">text</a>');
    expect(html).not.toMatch(/script|onclick|onerror|data:|javascript:|position:/);
    expect(html).toContain('text-align:center');
    expect(html).toContain('<strong>world</strong>');
    expect(html).toContain('src="https://example.com/a.png"');
  });
  it('retains editor headings, lists, underline and blockquotes', () => {
    const html = '<h2>Title</h2><ol><li><p><u>One</u></p></li></ol><blockquote><p><em>Quote</em></p></blockquote>';
    expect(sanitizeContent(html)).toBe(html);
  });
  it('uses the original figure styling for inline images without nesting existing figures', () => {
    expect(sanitizeContent('<img src="https://example.com/image.png">')).toBe('<figure><img src="https://example.com/image.png"></figure>');
    const figure = '<figure><img src="https://example.com/image.png"><figcaption>Caption</figcaption></figure>';
    expect(sanitizeContent(figure)).toBe(figure);
  });
  it('closes sign-ups after the first membership', () => {
    expect(signupsOpen(0)).toBe(true);
    expect(signupsOpen(1)).toBe(false);
    expect(signupsOpen(2)).toBe(false);
  });
});
