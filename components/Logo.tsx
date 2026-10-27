import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="StillWord, home">
      <svg width="9" height="18" viewBox="0 0 9 18" aria-hidden="true">
        <path d="M0 0 A9 9 0 0 1 0 18 Z" fill="currentColor" />
      </svg>
      <span>StillWord</span>
    </Link>
  );
}
