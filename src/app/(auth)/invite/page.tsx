"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { getGroup, addGroupMember } from "@/server/actions/groupActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthUser();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const groupId = searchParams.get("groupId");

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    getGroup(groupId).then((g) => {
      setGroup(g);
      setLoading(false);
    });
  }, [groupId]);

  const handleAccept = async () => {
    if (!user || !groupId) return;

    setAccepting(true);
    try {
      await addGroupMember(groupId, user.uid);
      toast.success("Successfully joined group!");
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error("[v0] Error accepting invite:", error);
      toast.error("Failed to join group");
    } finally {
      setAccepting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You need to sign in to accept this invitation.</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This invitation link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (group.memberIds?.includes(user.uid)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Already a member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">You're already a member of this group.</p>
            <Button onClick={() => router.push(`/group/${groupId}`)} className="w-full">
              Go to group
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle>Group invitation</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">You've been invited to join</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-accent/50">
            <h3 className="font-semibold text-lg">{group.name}</h3>
            {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
            <p className="text-xs text-muted-foreground mt-2">{group.memberIds?.length || 0} members</p>
          </div>
          <Button onClick={handleAccept} disabled={accepting} className="w-full">
            {accepting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Accept invitation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
