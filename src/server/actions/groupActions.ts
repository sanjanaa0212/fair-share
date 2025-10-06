"use server";

import { getDb, type Group } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { env } from "@/env";

export async function createGroup(data: {
  name: string;
  description?: string;
  createdBy: string;
  memberIds?: string[];
}) {
  const db = await getDb();
  const result = await db.collection<Group>("groups").insertOne({
    name: data.name,
    description: data.description,
    memberIds: data.memberIds || [data.createdBy],
    createdBy: data.createdBy,
    createdAt: new Date(),
  });
  revalidatePath("/dashboard");
  return { id: result.insertedId.toString() };
}

export async function getGroup(id: string) {
  const db = await getDb();
  const group = await db.collection<Group>("groups").findOne({ _id: new ObjectId(id) });
  if (!group) return null;
  return { ...group, _id: group._id.toString() };
}

export async function getUserGroups(uid: string) {
  const db = await getDb();
  const groups = await db.collection<Group>("groups").find({ memberIds: uid }).sort({ createdAt: -1 }).toArray();
  return groups.map((g) => ({ ...g, _id: g._id!.toString() }));
}

export async function addGroupMember(groupId: string, uid: string) {
  const db = await getDb();
  await db.collection<Group>("groups").updateOne({ _id: new ObjectId(groupId) }, { $addToSet: { memberIds: uid } });
  revalidatePath(`/group/${groupId}`);
}

export async function removeGroupMember(groupId: string, uid: string) {
  const db = await getDb();
  await db.collection<Group>("groups").updateOne({ _id: new ObjectId(groupId) }, { $pull: { memberIds: uid } });
  revalidatePath(`/group/${groupId}`);
  return { success: true };
}

export async function inviteToGroup(data: { groupId: string; email: string; name?: string; phone?: string }) {
  // Send email invite via Gmail
  await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function deleteGroup(groupId: string, uid: string) {
  const db = await getDb();

  // Verify user is the creator
  const group = await db.collection<Group>("groups").findOne({ _id: new ObjectId(groupId) });
  if (!group || group.createdBy !== uid) {
    throw new Error("Unauthorized");
  }

  // Delete all expenses in the group
  await db.collection("expenses").deleteMany({ groupId });

  // Delete the group
  await db.collection<Group>("groups").deleteOne({ _id: new ObjectId(groupId) });

  revalidatePath("/dashboard");
  return { success: true };
}
