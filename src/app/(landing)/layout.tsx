import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // const user = sess?.user;

  // if (user) redirect("/dashboard");

  return (
    <>
      {children}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-screen-md px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FairShare
        </div>
      </footer>
    </>
  );
}
