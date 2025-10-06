import { Header } from "@/components/common/header";
import { MobileNav } from "@/components/common/mobile-nav";

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-screen-lg w-full">{children}</div>
      <MobileNav />
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-screen-md px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SplitBuddy
        </div>
      </footer>
    </div>
  );
}
