"use server";

import { getDb, type Invite, type User } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createInvite(data: {
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  inviteeEmail: string;
  inviteeName?: string;
  inviteePhone?: string;
}) {
  const db = await getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  // Create invite
  await db.collection<Invite>("invites").insertOne({
    ...data,
    token,
    status: "pending",
    expiresAt,
    createdAt: new Date(),
  });

  // Create pending user if doesn't exist
  const existingUser = await db.collection<User>("users").findOne({ email: data.inviteeEmail });
  if (!existingUser) {
    await db.collection<User>("users").insertOne({
      firebaseUid: "", // Will be filled when they sign up
      email: data.inviteeEmail,
      name: data.inviteeName || "",
      phone: data.inviteePhone,
      photoURL: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath(`/group/${data.groupId}`);
  return { token, expiresAt };
}

export async function acceptInvite(token: string, firebaseUid: string) {
  const db = await getDb();

  const invite = await db.collection<Invite>("invites").findOne({ token, status: "pending" });
  if (!invite || invite.expiresAt < new Date()) {
    return { success: false, error: "Invite expired or invalid" };
  }

  // Update user with Firebase UID if they were a pending user
  await db
    .collection<User>("users")
    .updateOne({ email: invite.inviteeEmail }, { $set: { firebaseUid, updatedAt: new Date() } });

  // Add user to group memberIds array
  await db
    .collection("groups")
    .updateOne({ _id: new ObjectId(invite.groupId) }, { $addToSet: { memberIds: firebaseUid } });

  // Mark invite as accepted
  await db.collection<Invite>("invites").updateOne({ token }, { $set: { status: "accepted", acceptedAt: new Date() } });

  revalidatePath(`/group/${invite.groupId}`);
  return { success: true, groupId: invite.groupId };
}

export async function getPendingInvites(email: string) {
  const db = await getDb();
  const invites = await db
    .collection<Invite>("invites")
    .find({ inviteeEmail: email, status: "pending", expiresAt: { $gt: new Date() } })
    .toArray();
  return invites.map((i) => ({ ...i, _id: i._id!.toString() }));
}
