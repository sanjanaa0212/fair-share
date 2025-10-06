"use client";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Home, LogOut, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function MobileNav() {
  const router = useRouter();
  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50">
      <div className="mx-auto max-w-screen-md grid grid-cols-4 text-xs">
        <Link href="/dashboard" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <Home className="size-5" />
          <span>Home</span>
        </Link>
        <Link href="/friends" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <Users className="size-5" />
          <span>Friends</span>
        </Link>
        <Link href="/friends" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <User className="size-5" />
          <span>Profile</span>
        </Link>
        <ConfirmationDialog
          title="Are you sure?"
          description="You'll be logged out !"
          functionToBeExecuted={handleLogout}
          actionButtonText="Logout"
          type="failure"
          className="w-full"
        >
          <div className="flex flex-col items-center gap-1 py-4 text-muted-foreground">
            <LogOut className="size-5" />
            <span>Logout</span>
          </div>
        </ConfirmationDialog>
      </div>
    </nav>
  );
}
