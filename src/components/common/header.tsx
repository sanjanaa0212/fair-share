export const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-screen-lg px-4 py-3 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          <span className="font-semibold tracking-tight">Fair Share</span>
        </a>
        <nav className="hidden sm:flex items-center gap-3 text-sm">
          <a href="/dashboard" className="hover:underline">
            Dashboard
          </a>
          <a href="/friends" className="hover:underline">
            Friends
          </a>
          <a href="/profile" className="hover:underline">
            Profile
          </a>
        </nav>
      </div>
    </header>
  );
};
