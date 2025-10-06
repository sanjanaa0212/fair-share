import Link from "next/link";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-screen-lg px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          <span className="font-semibold tracking-tight">Fair Share</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/friends" className="hover:underline">
            Friends
          </Link>
          <Link href="/profile" className="hover:underline">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
};
