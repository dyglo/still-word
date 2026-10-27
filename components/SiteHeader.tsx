import Link from "next/link";
import Logo from "./Logo";

export default function SiteHeader() {
  return (
    <header className="hdr">
      <Logo />
      <Link href="/" className="menu" aria-label="All posts">
        <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
          <path d="M0 1h16M0 6h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </Link>
    </header>
  );
}
