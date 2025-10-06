"use server";

import { getDb, type Friend, type User } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export async function addFriend(userId: string, friendEmail: string) {
  const db = await getDb();

  // Find friend by email
  const friend = await db.collection<User>("users").findOne({ email: friendEmail });
  if (!friend || !friend.firebaseUid) {
    return { success: false, error: "User not found" };
  }

  if (friend.firebaseUid === userId) {
    return { success: false, error: "Cannot add yourself as friend" };
  }

  // Check if already friends
  const existing = await db.collection<Friend>("friends").findOne({
    $or: [
      { userId, friendId: friend.firebaseUid },
      { userId: friend.firebaseUid, friendId: userId },
    ],
  });

  if (existing) {
    return { success: false, error: "Already friends or request pending" };
  }

  // Create friend request
  await db.collection<Friend>("friends").insertOne({
    userId,
    friendId: friend.firebaseUid,
    status: "accepted", // Auto-accept for simplicity
    createdAt: new Date(),
    acceptedAt: new Date(),
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function getFriends(userId: string) {
  const db = await getDb();

  const friendships = await db
    .collection<Friend>("friends")
    .find({
      $or: [
        { userId, status: "accepted" },
        { friendId: userId, status: "accepted" },
      ],
    })
    .toArray();

  const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));

  if (friendIds.length === 0) return [];

  const friends = await db
    .collection<User>("users")
    .find({ firebaseUid: { $in: friendIds } })
    .toArray();

  return friends.map((f) => ({ ...f, _id: f._id!.toString() }));
}

export async function getFriendBalances(userId: string) {
  const db = await getDb();

  // Get all balances involving this user
  const balances = await db
    .collection("balances")
    .find({ $or: [{ from: userId }, { to: userId }] })
    .toArray();

  // Group by friend
  const friendBalances: Record<string, number> = {};

  for (const balance of balances) {
    if (balance.from === userId) {
      // User owes this person
      friendBalances[balance.to] = (friendBalances[balance.to] || 0) - balance.amount;
    } else {
      // This person owes user
      friendBalances[balance.from] = (friendBalances[balance.from] || 0) + balance.amount;
    }
  }

  return Object.entries(friendBalances).map(([friendId, amount]) => ({
    friendId,
    amount,
  }));
}

export async function removeFriend(userId: string, friendId: string) {
  const db = await getDb();

  await db.collection<Friend>("friends").deleteOne({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ],
  });

  revalidatePath("/friends");
  return { success: true };
}
