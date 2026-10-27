'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

let visitRequest: Promise<unknown> | null = null;
function record(type: 'visit' | 'view' | 'read', postId?: string) {
  return fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, postId }), keepalive: true }).catch(() => null);
}

export function VisitorAnalytics() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith('/admin') || path.startsWith('/auth') || path.startsWith('/posts/')) return;
    visitRequest = record('visit');
  }, [path]);
  return null;
}

export function PostAnalytics({ postId }: { postId: string }) {
  useEffect(() => {
    let cancelled = false;
    let completed = false;
    const view = Promise.resolve(visitRequest).then(() => cancelled ? null : record('view', postId));
    const article = document.querySelector('article.prose') as HTMLElement | null;
    if (!article) return;
    const originalPosition = article.style.position;
    article.style.position = 'relative';
    const marker = document.createElement('span');
    marker.setAttribute('aria-hidden', 'true');
    marker.style.cssText = 'position:absolute;top:90%;left:0;width:1px;height:1px;pointer-events:none';
    article.append(marker);
    const observer = new IntersectionObserver(entries => {
      if (completed || !entries.some(e => e.isIntersecting)) return;
      completed = true;
      void view.then(() => cancelled ? null : record('read', postId));
      observer.disconnect();
    });
    observer.observe(marker);
    return () => { cancelled = true; observer.disconnect(); marker.remove(); article.style.position = originalPosition; };
  }, [postId]);
  return null;
}
