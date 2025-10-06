import { MongoClient, type Db, type ObjectId } from "mongodb";
import { env } from "@/env";

if (!env.NEXT_PUBLIC_MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env");
}

const uri = env.NEXT_PUBLIC_MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("fairshare");
}

export type User = {
  _id?: ObjectId;
  firebaseUid: string;
  email: string;
  name?: string;
  phone?: string;
  photoURL?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserClient = {
  _id: string;
  uid: string; // This is firebaseUid
  email: string;
  name?: string;
  phone?: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Group = {
  _id?: ObjectId;
  name: string;
  description?: string;
  avatar?: string;
  memberIds: string[]; // Firebase UIDs
  createdBy: string;
  createdAt: Date;
};

export type Expense = {
  _id?: ObjectId;
  groupId: string;
  title: string;
  amount: number;
  paidBy: string; // Firebase UID
  splitType: "equal" | "percentage" | "exact";
  splits: Record<string, number>; // uid -> amount
  date: Date;
  notes?: string;
  images?: string[];
  category?: string;
  createdAt: Date;
};

export type Settlement = {
  _id?: ObjectId;
  groupId: string;
  from: string; // Firebase UID
  to: string; // Firebase UID
  amount: number;
  settledAt: Date;
  notes?: string;
};

export type Invite = {
  _id?: ObjectId;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  inviteeEmail: string;
  inviteeName?: string;
  inviteePhone?: string;
  status: "pending" | "accepted" | "expired";
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
};

export type Friend = {
  _id?: ObjectId;
  userId: string; // Firebase UID
  friendId: string; // Firebase UID
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  acceptedAt?: Date;
};
