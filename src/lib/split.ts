// Helpers for bill splitting and balances

export function computeSplit(
  mode: "equal" | "percent" | "exact",
  memberIds: string[],
  amounts: Record<string, number>,
  total: number
) {
  if (mode === "equal") {
    const each = total / Math.max(memberIds.length, 1);
    return Object.fromEntries(memberIds.map((m) => [m, round2(each)]));
  }
  if (mode === "percent") {
    const shares = Object.values(amounts).reduce((a, b) => a + b, 0) || 100;
    return Object.fromEntries(memberIds.map((m) => [m, round2(total * ((amounts[m] || 0) / shares))]));
  }
  // exact
  return Object.fromEntries(memberIds.map((m) => [m, round2(amounts[m] || 0)]));
}

export function computeBalances(selfId: string, bills: any[]) {
  // accumulate net per user relative to each bill's creator
  const net: Record<string, number> = {};
  for (const b of bills) {
    const payer = b.createdBy as string;
    for (const [member, share] of Object.entries(b.amounts || {})) {
      if (member === payer) continue;
      // member owes payer share
      net[member] = (net[member] || 0) - Number(share);
      net[payer] = (net[payer] || 0) + Number(share);
    }
  }
  // greedy settle
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, v }));
  const debtors = Object.entries(net)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, v: -v }));
  creditors.sort((a, b) => b.v - a.v);
  debtors.sort((a, b) => b.v - a.v);

  const settlements: { from: string; to: string; amount: number; fromName?: string; toName?: string }[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].v, creditors[j].v);
    settlements.push({ from: debtors[i].id, to: creditors[j].id, amount: round2(pay) });
    debtors[i].v = round2(debtors[i].v - pay);
    creditors[j].v = round2(creditors[j].v - pay);
    if (debtors[i].v === 0) i++;
    if (creditors[j].v === 0) j++;
  }

  return { net, settlements: settlements.map((s) => ({ ...s, fromName: s.from, toName: s.to })) };
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
