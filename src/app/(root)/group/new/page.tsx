"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createGroup } from "@/server/actions/groupActions";

export default function NewGroupPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  async function create() {
    if (!auth.currentUser || !name.trim()) return;
    // const docRef = await addDoc(collection(db, "groups"), {
    //   name,
    //   createdBy: auth.currentUser.uid,
    //   memberIds: [auth.currentUser.uid],
    //   createdAt: serverTimestamp(),
    // });
    const docRef = createGroup({ name, createdBy: auth.currentUser.uid, memberIds: [auth.currentUser.uid] });
    console.log(docRef);

    router.replace(`/group/${(await docRef).id}`);
  }
  return (
    <div className="py-6 grid gap-3">
      <h1 className="text-2xl font-semibold">New group</h1>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" />
      <Button onClick={create}>Create</Button>
    </div>
  );
}
