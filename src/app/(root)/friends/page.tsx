"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/hooks/use-auth-user";
import { addFriend, getFriendBalances, getFriends, removeFriend } from "@/server/actions/friendActions";
import { getUsersByIds } from "@/server/actions/userActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuthUser();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["friends", user?.uid],
    queryFn: () => getFriends(user!.uid),
    enabled: !!user,
  });

  const { data: balances = [] } = useQuery({
    queryKey: ["friend-balances", user?.uid],
    queryFn: () => getFriendBalances(user!.uid),
    enabled: !!user,
  });

  const [friendUsers, setFriendUsers] = useState<any[]>([]);

  useEffect(() => {
    if (balances.length > 0) {
      const friendIds = balances.map((b: any) => b.friendId);
      getUsersByIds(friendIds).then(setFriendUsers);
    }
  }, [balances]);

  const addMutation = useMutation({
    mutationFn: (email: string) => addFriend(user!.uid, email),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Friend added successfully!");
        setEmail("");
        queryClient.invalidateQueries({ queryKey: ["friends", user?.uid] });
      } else {
        toast.error(result.error || "Failed to add friend");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendId: string) => removeFriend(user!.uid, friendId),
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends", user?.uid] });
    },
  });

  if (authLoading || friendsLoading) {
    return <FriendsSkeleton />;
  }

  const balanceMap = Object.fromEntries(balances.map((b: any) => [b.friendId, b.amount]));

  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold">Friends</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your friends and balances</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Add friend</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) addMutation.mutate(email);
                }}
                className="flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="Enter friend's email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={addMutation.isPending}>
                  <UserPlus className="mr-1 size-4" /> Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Your friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend: any) => {
                    const balance = balanceMap[friend.uid] || 0;
                    return (
                      <motion.div
                        key={friend.uid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{friend.name?.[0] || friend.email?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.name || "Unnamed"}</p>
                            <p className="text-xs text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {balance !== 0 && (
                            <Badge variant={balance > 0 ? "default" : "destructive"}>
                              {balance > 0 ? `₹${balance.toFixed(2)}` : `-₹${Math.abs(balance).toFixed(2)}`}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMutation.mutate(friend.uid)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="size-12 mx-auto mb-3 opacity-50" />
                  <p>No friends yet</p>
                  <p className="text-sm mt-1">Add friends to start splitting expenses</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* <MobileNav /> */}
    </div>
  );
}

function FriendsSkeleton() {
  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="  px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
