"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthUser } from "@/hooks/use-auth-user";
import { createExpense } from "@/server/actions/expenseActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(1, "Expense name is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string(),
  splitType: z.enum(["equal", "percentage", "exact"]),
  selectedMembers: z.array(z.string()).min(1, "Select at least one member"),
  notes: z.string().optional(),
  date: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  groupId: string;
  members?: any[];
  trigger?: React.ReactNode;
};

export function BillForm({ groupId, members = [], trigger }: Props) {
  const router = useRouter();
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      category: "Food",
      splitType: "equal",
      selectedMembers: [],
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open && members.length > 0) {
      const memberIds = members.map((m) => m.uid || m.firebaseUid).filter(Boolean);
      form.setValue("selectedMembers", memberIds);
    }
  }, [open, members, form]);

  const createExpenseMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("Not authenticated");

      const amount = Number.parseFloat(values.amount);
      const selectedUids = values.selectedMembers;

      let splits: Record<string, number> = {};
      if (values.splitType === "equal") {
        const perPerson = amount / selectedUids.length;
        splits = Object.fromEntries(selectedUids.map((uid) => [uid, perPerson]));
      } else {
        // For now, default to equal for percentage and exact
        const perPerson = amount / selectedUids.length;
        splits = Object.fromEntries(selectedUids.map((uid) => [uid, perPerson]));
      }

      return createExpense({
        groupId,
        title: values.title,
        amount,
        paidBy: user.uid,
        splitType: values.splitType,
        splits,
        date: values.date,
        notes: values.notes,
        images,
        category: values.category,
      });
    },
    onSuccess: () => {
      toast.success("Expense added successfully!");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["group-transactions", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-balances", groupId] });
      setOpen(false);
      form.reset();
      setImages([]);
      router.refresh();
    },
    onError: (error) => {
      console.error("[v0] Error creating expense:", error);
      toast.error("Failed to add expense");
    },
  });

  async function onSubmit(values: FormValues) {
    createExpenseMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button size="sm">Add expense</Button>}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dinner at restaurant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="splitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Split type</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {(["equal", "percentage", "exact"] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={field.value === type ? "default" : "outline"}
                        onClick={() => field.onChange(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {members.length > 0 && (
              <FormField
                control={form.control}
                name="selectedMembers"
                render={() => (
                  <FormItem>
                    <FormLabel>Split between (select members)</FormLabel>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {members.map((member: any) => {
                        const memberId = member.uid || member.firebaseUid;
                        const memberName = member.displayName || member.name || member.email;

                        if (!memberId) {
                          console.error("[v0] Member missing ID:", member);
                          return null;
                        }

                        return (
                          <FormField
                            key={memberId}
                            control={form.control}
                            name="selectedMembers"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(memberId)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked ? [...current, memberId] : current.filter((id) => id !== memberId)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer flex-1">
                                  {memberName}
                                  {memberId === user?.uid && <span className="text-muted-foreground ml-1">(You)</span>}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional details..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={createExpenseMutation.isPending}>
              {createExpenseMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Add expense
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
