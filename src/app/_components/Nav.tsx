import Link from "next/link";
import { MarkLogo } from "./Vinyl";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <MarkLogo size={30} />
        <span>
          makemea<span className="dot">mix</span>
        </span>
      </Link>
      <div className="nav-links">
        <ThemeToggle />
        <Link href="/craft" className="btn btn-sm btn-primary">
          Craft a mix
        </Link>
      </div>
    </nav>
  );
}
