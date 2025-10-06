"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroup, removeGroupMember, deleteGroup } from "@/server/actions/groupActions";
import { getGroupTransactions, getGroupBalances, createSettlement } from "@/server/actions/expenseActions";
import { getUsersByIds } from "@/server/actions/userActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Receipt,
  UsersIcon,
  BarChart3,
  Mail,
  Settings,
  LogOut,
  Trash2,
  History,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { BillForm } from "@/components/forms/bill-form";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ResponsiveContainer, Pie, PieChart, Cell, Legend } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddMemberDialog } from "@/components/dialogs/add-member-dialog";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<any>(null);

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
    enabled: !!id,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["group-transactions", id],
    queryFn: () => getGroupTransactions(id),
    enabled: !!id,
  });

  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ["group-balances", id],
    queryFn: () => getGroupBalances(id),
    enabled: !!id,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["group-members", id],
    queryFn: async () => {
      if (!group?.memberIds) return [];
      return getUsersByIds(group.memberIds);
    },
    enabled: !!group?.memberIds,
  });

  const settleMutation = useMutation({
    mutationFn: (data: { from: string; to: string; amount: number }) => createSettlement({ groupId: id, ...data }),
    onSuccess: () => {
      toast.success("Settlement recorded!");
      queryClient.invalidateQueries({ queryKey: ["group-balances", id] });
      queryClient.invalidateQueries({ queryKey: ["group-transactions", id] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      setSettleDialogOpen(false);
      setSelectedBalance(null);
    },
    onError: () => {
      toast.error("Failed to record settlement");
    },
  });

  const handleInvite = async () => {
    const email = prompt("Enter email address to invite:");
    if (!email) return;

    try {
      await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user?.displayName, email, groupId: id, groupName: group?.name }),
      });
      toast.success("Invite sent!");
    } catch (error) {
      toast.error("Failed to send invite");
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    try {
      await removeGroupMember(id, user.uid);
      toast.success("Left group successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to leave group");
    }
  };

  const handleDeleteGroup = async () => {
    if (!user) return;
    try {
      await deleteGroup(id, user.uid);
      toast.success("Group deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const handleSettleUp = (balance: any) => {
    setSelectedBalance(balance);
    setSettleDialogOpen(true);
  };

  const isAdmin = user && group?.createdBy === user.uid;
  const loading = groupLoading || transactionsLoading || balancesLoading || membersLoading;

  if (loading) {
    return <GroupSkeleton />;
  }

  if (!group) {
    return <div className="p-6 text-center">Group not found</div>;
  }

  const expenses = transactions.filter((t) => t.type === "expense");
  const categoryData = expenses.reduce<Record<string, number>>((acc, e: any) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{group.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{members.length} members</p>
          </div>
          <div className="flex items-center gap-2">
            <BillForm
              groupId={id}
              members={members}
              trigger={
                <Button size="sm">
                  <Plus className="mr-1 size-4" /> Add expense
                </Button>
              }
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Settings className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div onClick={handleInvite}>
                  <Mail className="mr-2 size-4" />
                  Invite member
                </div>
                <div />
                <AddMemberDialog groupId={group._id} groupName={group.name} />
                {isAdmin ? (
                  <div onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    Delete group
                  </div>
                ) : (
                  <div onClick={() => setShowLeaveDialog(true)} className="text-destructive">
                    <LogOut className="mr-2 size-4" />
                    Leave group
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="size-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <UsersIcon className="size-4" />
              <span className="hidden sm:inline">Balances</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="size-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transaction history</CardTitle>
                <Badge variant="secondary">{transactions.length} total</Badge>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction: any) => {
                      if (transaction.type === "expense") {
                        const payer = members.find((m) => m.uid === transaction.paidBy);
                        return (
                          <motion.div
                            key={transaction._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-primary/10 p-2">
                                <Receipt className="size-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{transaction.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Paid by {payer?.name || payer?.email || "Unknown"} •{" "}
                                  {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                              {transaction.category && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {transaction.category}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        );
                      } else {
                        const from = members.find((m) => m.uid === transaction.from);
                        const to = members.find((m) => m.uid === transaction.to);
                        return (
                          <motion.div
                            key={transaction._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between rounded-lg border p-4 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-green-200 dark:bg-green-900/50 p-2">
                                <CheckCircle2 className="size-4 text-green-700 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-green-900 dark:text-green-300">Settlement</p>
                                <p className="text-xs text-green-700 dark:text-green-400">
                                  {from?.name || from?.email} paid {to?.name || to?.email} •{" "}
                                  {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-900 dark:text-green-300">
                                ${transaction.amount.toFixed(2)}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-xs mt-1 border-green-600 text-green-700 dark:text-green-400"
                              >
                                Settled
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="size-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm mt-1">Add your first expense to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Who owes whom</CardTitle>
              </CardHeader>
              <CardContent>
                {balances.length > 0 ? (
                  <div className="space-y-3">
                    {balances.map((balance: any, i: number) => {
                      const from = members.find((m) => m.uid === balance.from);
                      const to = members.find((m) => m.uid === balance.to);
                      const isUserInvolved = user && (balance.from === user.uid || balance.to === user.uid);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="size-6 sm:size-10">
                              <AvatarImage src={from?.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{from?.name?.[0] || from?.email?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm sm:text-base line-clamp-1">
                                {from?.name || from?.email || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">owes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="font-bold  text-sm sm:text-base">${balance.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">to</p>
                            </div>
                            <Avatar className="size-6 sm:size-10">
                              <AvatarImage src={to?.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{to?.name?.[0] || to?.email?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium  text-sm sm:text-base line-clamp-1">{to?.name || "Unnamed"}</p>
                            </div>
                          </div>
                          {isUserInvolved && (
                            <Button size="sm" variant="outline" onClick={() => handleSettleUp(balance)}>
                              <CheckCircle2 className="mr-1 size-4" /> Settle
                            </Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <UsersIcon className="size-12 mx-auto mb-3 opacity-50" />
                    <p>All settled up! 🎉</p>
                    <p className="text-sm mt-1">No outstanding balances</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Members</CardTitle>
                <Button size="sm" variant="outline" onClick={handleInvite}>
                  <Mail className="mr-1 size-4" /> Invite
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {members.map((member: any) => (
                    <div key={member.uid} className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.name?.[0] || member.email?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      {member.uid === group.createdBy && <Badge variant="secondary">Admin</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expenses only</CardTitle>
                <Badge variant="secondary">{expenses.length} total</Badge>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense: any) => {
                      const payer = members.find((m) => m.uid === expense.paidBy);
                      return (
                        <motion.div
                          key={expense._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Receipt className="size-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{expense.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Paid by {payer?.name || payer?.email || "Unknown"} •{" "}
                                {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                            {expense.category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {expense.category}
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="size-12 mx-auto mb-3 opacity-50" />
                    <p>No expenses yet</p>
                    <p className="text-sm mt-1">Add your first expense to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by category</CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ChartContainer
                      config={Object.fromEntries(
                        pieData.map((d, i) => [d.name, { label: d.name, color: COLORS[i % COLORS.length] }])
                      )}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <p>No data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <p className="text-4xl font-bold">
                        ${expenses.reduce((sum: number, e: any) => sum + e.amount, 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Total group spending</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{expenses.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Expenses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{members.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Members</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and all its expenses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave group?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer have access to this group's expenses and balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record settlement</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBalance && (
                <>
                  Confirm that{" "}
                  {members.find((m) => m.uid === selectedBalance.from)?.name ||
                    members.find((m) => m.uid === selectedBalance.from)?.email}{" "}
                  paid ${selectedBalance.amount.toFixed(2)} to{" "}
                  {members.find((m) => m.uid === selectedBalance.to)?.name ||
                    members.find((m) => m.uid === selectedBalance.to)?.email}
                  ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedBalance) {
                  settleMutation.mutate({
                    from: selectedBalance.from,
                    to: selectedBalance.to,
                    amount: selectedBalance.amount,
                  });
                }
              }}
              disabled={settleMutation.isPending}
            >
              {settleMutation.isPending ? "Recording..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
