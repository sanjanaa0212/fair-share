import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // const user = sess?.user;

  // if (user) redirect("/dashboard");

  return <>{children}</>;
}
