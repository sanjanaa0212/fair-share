"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthUser } from "@/hooks/use-auth-user";
import { createGroup } from "@/server/actions/groupActions";
import { getFriends } from "@/server/actions/friendActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  friendIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateGroupDialog() {
  const router = useRouter();
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", user?.uid],
    queryFn: () => getFriends(user!.uid),
    enabled: !!user?.uid && open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      friendIds: [],
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("Not authenticated");
      const memberIds = [user.uid, ...(values.friendIds || [])];
      return createGroup({
        name: values.name,
        description: values.description,
        createdBy: user.uid,
        memberIds,
      });
    },
    onSuccess: (result) => {
      toast.success("Group created successfully!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      form.reset();
      router.push(`/group/${result.id}`);
    },
    onError: (error) => {
      console.error("[v0] Error creating group:", error);
      toast.error("Failed to create group");
    },
  });

  async function onSubmit(values: FormValues) {
    createGroupMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" /> New group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. College Friends" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What's this group for?" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {friends.length > 0 && (
              <FormField
                control={form.control}
                name="friendIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Add friends to group</FormLabel>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {friends.map((friend: any) => {
                        const friendId = friend.firebaseUid || friend.uid;
                        const friendName = friend.displayName || friend.name || friend.email;

                        if (!friendId) {
                          console.error("[v0] Friend missing ID:", friend);
                          return null;
                        }

                        return (
                          <FormField
                            key={friendId}
                            control={form.control}
                            name="friendIds"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(friendId)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked ? [...current, friendId] : current.filter((id) => id !== friendId)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer flex-1">
                                  {friendName}
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
            <Button type="submit" className="w-full" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create group
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
