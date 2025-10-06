"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useQuery } from "@tanstack/react-query";
import { getUserGroups } from "@/server/actions/groupActions";
import { getUserExpenses, getUserBalances } from "@/server/actions/expenseActions";
import { syncUser } from "@/server/actions/userActions";
import { getFriendBalances } from "@/server/actions/friendActions";
import { getUsersByIds } from "@/server/actions/userActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Home, LayoutDashboard, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import { CreateGroupDialog } from "@/components/dialogs/create-group-dialog";

export default function DashboardPage() {
  const { user, loading } = useAuthUser();

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["groups", user?.uid],
    queryFn: () => getUserGroups(user!.uid),
    enabled: !!user,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", user?.uid],
    queryFn: () => getUserExpenses(user!.uid),
    enabled: !!user,
  });

  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ["balances", user?.uid],
    queryFn: () => getUserBalances(user!.uid),
    enabled: !!user,
  });

  const { data: friendBalances = [] } = useQuery({
    queryKey: ["friend-balances", user?.uid],
    queryFn: () => getFriendBalances(user!.uid),
    enabled: !!user,
  });

  const { data: friendUsers = [] } = useQuery({
    queryKey: ["friend-users", friendBalances],
    queryFn: async () => {
      if (friendBalances.length === 0) return [];
      const friendIds = friendBalances.map((b: any) => b.friendId);
      return getUsersByIds(friendIds);
    },
    enabled: friendBalances.length > 0,
  });

  useEffect(() => {
    if (!user) return;
    syncUser({
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || undefined,
      avatar: user.photoURL || undefined,
    });
  }, [user]);

  const totalOwed = balances.filter((b: any) => b.to === user?.uid).reduce((sum: number, b: any) => sum + b.amount, 0);
  const totalOwing = balances
    .filter((b: any) => b.from === user?.uid)
    .reduce((sum: number, b: any) => sum + b.amount, 0);

  const chartData = expenses.reduce<Record<string, number>>((acc, e: any) => {
    const month = new Date(e.date).toLocaleString(undefined, { month: "short" });
    acc[month] = (acc[month] || 0) + (e.paidBy === user?.uid ? e.amount : 0);
    return acc;
  }, {});
  const series = Object.entries(chartData).map(([month, total]) => ({ month, total }));

  if (loading || groupsLoading || expensesLoading || balancesLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className=" px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's your expense overview</p>
          </div>
          <CreateGroupDialog />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">You are owed</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">${totalOwed.toFixed(2)}</p>
                </div>
                <div className="rounded-full bg-green-200 dark:bg-green-900/50 p-3">
                  <TrendingUp className="size-5 text-green-700 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400">You owe</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-300 mt-2">
                    ${totalOwing.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-orange-200 dark:bg-orange-900/50 p-3">
                  <TrendingDown className="size-5 text-orange-700 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {friendBalances.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle>Friend balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {friendBalances.slice(0, 5).map((fb: any) => {
                    const friend = friendUsers.find((f: any) => f.uid === fb.friendId);
                    if (!friend) return null;
                    return (
                      <div key={fb.friendId} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{friend.name || friend.email}</span>
                        <span className={fb.amount > 0 ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                          {fb.amount > 0 ? `+$${fb.amount.toFixed(2)}` : `-$${Math.abs(fb.amount).toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Your spending</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center px-0">
              {series.length > 0 ? (
                <ChartContainer
                  config={{
                    total: { label: "Amount", color: "var(--chart-1)" },
                  }}
                  className="h-64 w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>No expenses yet. Add your first expense to see insights!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your groups</CardTitle>
              <CreateGroupDialog />
            </CardHeader>
            <CardContent>
              {groups.length > 0 ? (
                <div className="grid gap-3">
                  {groups.map((g: any) => (
                    <Link
                      key={g._id}
                      href={`/group/${g._id}`}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{g.memberIds?.length || 1} members</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No groups yet. Create your first group to start tracking expenses!</p>
                  <div className="mt-4">
                    <CreateGroupDialog />
                  </div>
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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="  px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
