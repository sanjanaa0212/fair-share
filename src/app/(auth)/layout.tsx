// import { getServerAuth } from "@/server/auth/server-sess";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // const sess = await getServerAuth();
  // const user = sess?.user;

  // if (user) redirect("/dashboard");

  return <>{children}</>;
}
