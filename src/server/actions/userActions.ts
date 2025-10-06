"use server";

import { getDb, type User } from "@/lib/mongodb";

export async function syncUser(data: { uid: string; email: string; name?: string; avatar?: string }) {
  const db = await getDb();

  const existing = await db.collection<User>("users").findOne({ firebaseUid: data.uid });

  if (existing) {
    await db
      .collection<User>("users")
      .updateOne(
        { firebaseUid: data.uid },
        { $set: { email: data.email, name: data.name, photoURL: data.avatar, updatedAt: new Date() } }
      );
    return existing;
  }

  await db.collection<User>("users").insertOne({
    firebaseUid: data.uid,
    email: data.email,
    name: data.name,
    photoURL: data.avatar,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return data;
}

export async function getUser(uid: string) {
  const db = await getDb();
  const user = await db.collection<User>("users").findOne({ firebaseUid: uid });
  if (!user) return null;
  return { ...user, _id: user._id!.toString(), uid: user.firebaseUid, avatar: user.photoURL };
}

export async function getUsersByIds(uids: string[]) {
  const db = await getDb();
  const users = await db
    .collection<User>("users")
    .find({ firebaseUid: { $in: uids } })
    .toArray();
  return users.map((u) => ({ ...u, _id: u._id!.toString(), uid: u.firebaseUid, avatar: u.photoURL }));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  const user = await db.collection<User>("users").findOne({ email });
  if (!user) return null;
  return { ...user, _id: user._id!.toString(), uid: user.firebaseUid, avatar: user.photoURL };
}

export async function updateUserProfile(uid: string, data: { name?: string; phone?: string; avatar?: string }) {
  const db = await getDb();
  await db
    .collection<User>("users")
    .updateOne({ firebaseUid: uid }, { $set: { ...data, photoURL: data.avatar, updatedAt: new Date() } });
  return { success: true };
}
