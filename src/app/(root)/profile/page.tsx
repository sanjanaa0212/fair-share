"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/use-auth-user";
import { getUser, updateUserProfile } from "@/server/actions/userActions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2, Home, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email"),
  avatar: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      avatar: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    void getUser(user.uid).then((userData) => {
      if (userData) {
        form.reset({
          name: userData.name ?? "",
          phone: userData.phone ?? "",
          email: userData.email ?? "",
          avatar: userData.avatar ?? "",
        });
      }
      setDataLoading(false);
    });
  }, [user]);

  async function onSubmit(values: FormValues) {
    if (!user) return;
    setLoading(true);

    try {
      await updateUserProfile(user.uid, {
        name: values.name,
        phone: values.phone,
        avatar: values.avatar,
      });
      router.refresh();
    } catch (error) {
      console.error("[v0] Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  if (authLoading || dataLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save changes
                  </Button>
                  <Button type="button" onClick={handleLogout} variant="outline" className="flex-1 bg-transparent">
                    Log out
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MobileNav() {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50">
      <div className="mx-auto max-w-screen-md grid grid-cols-3 text-xs">
        <Link href="/" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <Home className="size-5" />
          <span>Home</span>
        </Link>
        <Link href="/dashboard" className="py-4 flex flex-col items-center gap-1 text-muted-foreground">
          <LayoutDashboard className="size-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/profile" className="py-4 flex flex-col items-center gap-1 text-primary font-medium">
          <User className="size-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
