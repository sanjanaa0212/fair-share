"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuthUser() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setLoading(true);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    setLoading(false);
    return () => unsub();
  }, []);
  return { user, loading };
}
