"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { syncUser } from "@/server/actions/userActions";
import { getPendingInvites, acceptInvite } from "@/server/actions/inviteActions";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const qp = useSearchParams();
  const redirect = qp.get("redirect") || "/dashboard";
  const inviteToken = qp.get("invite");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await syncUser({
          uid: u.uid,
          email: u.email!,
          name: u.displayName || undefined,
          avatar: u.photoURL || undefined,
        });

        // Check for invite token in URL
        if (inviteToken) {
          const result = await acceptInvite(inviteToken, u.uid);
          if (result.success && result.groupId) {
            router.replace(`/group/${result.groupId}`);
            return;
          }
        }

        // Check for pending invites by email
        const invites = await getPendingInvites(u.email!);
        if (invites.length > 0) {
          // Auto-accept first pending invite
          const result = await acceptInvite(invites[0].token, u.uid);
          if (result.success && result.groupId) {
            router.replace(`/group/${result.groupId}`);
            return;
          }
        }

        router.replace(redirect);
      }
    });
    return () => unsub();
  }, [router, redirect, inviteToken]);

  async function login() {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function signup() {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to FairShare</CardTitle>
          <CardDescription>
            {inviteToken ? "Accept your invite by signing in or creating an account" : "Sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>
          <div className="space-y-2">
            <Button onClick={login} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Sign in
            </Button>
            <Button variant="secondary" onClick={signup} disabled={isLoading} className="w-full">
              Create account
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="outline" onClick={loginWithGoogle} disabled={isLoading} className="w-full bg-transparent">
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
