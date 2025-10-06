import { Header } from "@/components/common/header";
import { Home, LayoutDashboard, User, Users } from "lucide-react";
import Link from "next/link";

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-screen-lg w-full">{children}</div>
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50">
      <div className="mx-auto max-w-screen-md grid grid-cols-4 text-xs">
        <Link href="/" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <Home className="size-5" />
          <span>Home</span>
        </Link>
        <Link href="/dashboard" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <LayoutDashboard className="size-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/friends" className="py-4 flex flex-col items-center gap-1 text-primary font-medium">
          <Users className="size-5" />
          <span>Friends</span>
        </Link>
        <Link href="/profile" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <User className="size-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
