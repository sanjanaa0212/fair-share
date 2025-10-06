"use server";

import { getDb, type Expense, type Settlement } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export async function createExpense(data: {
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  splitType: "equal" | "percentage" | "exact";
  splits: Record<string, number>;
  date: string;
  notes?: string;
  images?: string[];
  category?: string;
}) {
  const db = await getDb();
  const result = await db.collection<Expense>("expenses").insertOne({
    ...data,
    date: new Date(data.date),
    createdAt: new Date(),
  });

  revalidatePath(`/group/${data.groupId}`);
  revalidatePath("/dashboard");
  return { id: result.insertedId.toString() };
}

export async function getGroupExpenses(groupId: string) {
  const db = await getDb();
  const expenses = await db.collection<Expense>("expenses").find({ groupId }).sort({ date: -1 }).toArray();
  return expenses.map((e) => ({ ...e, _id: e._id!.toString(), date: e.date.toISOString() }));
}

export async function getUserExpenses(uid: string) {
  const db = await getDb();
  const expenses = await db
    .collection<Expense>("expenses")
    .find({ $or: [{ paidBy: uid }, { [`splits.${uid}`]: { $exists: true } }] })
    .sort({ date: -1 })
    .limit(50)
    .toArray();
  return expenses.map((e) => ({ ...e, _id: e._id!.toString(), date: e.date.toISOString() }));
}

export async function getGroupBalances(groupId: string) {
  const db = await getDb();

  // Get all expenses for this group
  const expenses = await db.collection<Expense>("expenses").find({ groupId }).toArray();

  // Get all settlements for this group
  const settlements = await db.collection<Settlement>("settlements").find({ groupId }).toArray();

  // Compute net balances from expenses
  const net: Record<string, number> = {};

  for (const expense of expenses) {
    const payer = expense.paidBy;
    for (const [uid, amount] of Object.entries(expense.splits)) {
      if (uid === payer) continue;
      net[uid] = (net[uid] || 0) - amount;
      net[payer] = (net[payer] || 0) + amount;
    }
  }

  // Apply settlements to reduce balances
  for (const settlement of settlements) {
    net[settlement.from] = (net[settlement.from] || 0) + settlement.amount;
    net[settlement.to] = (net[settlement.to] || 0) - settlement.amount;
  }

  // Minimize transactions using greedy algorithm
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0.01)
    .map(([id, v]) => ({ id, amount: v }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(net)
    .filter(([, v]) => v < -0.01)
    .map(([id, v]) => ({ id, amount: -v }))
    .sort((a, b) => b.amount - a.amount);

  const balances: Array<{ from: string; to: string; amount: number }> = [];

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const payment = Math.min(debtors[i].amount, creditors[j].amount);

    if (payment > 0.01) {
      balances.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: Math.round(payment * 100) / 100,
      });
    }

    debtors[i].amount -= payment;
    creditors[j].amount -= payment;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return balances;
}

export async function getUserBalances(uid: string) {
  const db = await getDb();

  // Get all groups the user is in
  const groups = await db.collection("groups").find({ memberIds: uid }).toArray();

  // Compute balances for each group
  const allBalances: Array<{ groupId: string; from: string; to: string; amount: number }> = [];

  for (const group of groups) {
    const groupBalances = await getGroupBalances(group._id!.toString());
    allBalances.push(
      ...groupBalances
        .filter((b) => b.from === uid || b.to === uid)
        .map((b) => ({ ...b, groupId: group._id!.toString() }))
    );
  }

  return allBalances;
}

export async function createSettlement(data: {
  groupId: string;
  from: string;
  to: string;
  amount: number;
  notes?: string;
}) {
  const db = await getDb();

  const result = await db.collection<Settlement>("settlements").insertOne({
    ...data,
    settledAt: new Date(),
  });

  revalidatePath(`/group/${data.groupId}`);
  revalidatePath("/dashboard");

  return { id: result.insertedId.toString() };
}

export async function getGroupTransactions(groupId: string) {
  const db = await getDb();

  const expenses = await db.collection<Expense>("expenses").find({ groupId }).sort({ date: -1 }).toArray();
  const settlements = await db
    .collection<Settlement>("settlements")
    .find({ groupId })
    .sort({ settledAt: -1 })
    .toArray();

  // Combine and sort by date
  const transactions = [
    ...expenses.map((e) => ({
      _id: e._id!.toString(),
      type: "expense" as const,
      title: e.title,
      amount: e.amount,
      paidBy: e.paidBy,
      splits: e.splits,
      date: e.date.toISOString(),
      category: e.category,
      notes: e.notes,
    })),
    ...settlements.map((s) => ({
      _id: s._id!.toString(),
      type: "settlement" as const,
      from: s.from,
      to: s.to,
      amount: s.amount,
      date: s.settledAt.toISOString(),
      notes: s.notes,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return transactions;
}
