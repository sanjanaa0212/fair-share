"use client";
import type { Session } from "@/server/auth/config";
import { createContext, useContext } from "react";

const SessionContext = createContext<{ session: Session | null }>({
  session: null,
});

export const SessionProvider = ({ children, session }: { children: React.ReactNode; session: Session }) => {
  return <SessionContext.Provider value={{ session }}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const { session } = useContext(SessionContext);
  return session;
};
