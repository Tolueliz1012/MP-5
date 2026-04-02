import { redirect, notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";

interface Props {
  params: Promise<{ alias: string }>;
}

export default async function AliasPage({ params }: Props) {
  const { alias } = await params;

  const client = await clientPromise;
  const db = client.db("url-shortener");
  const collection = db.collection("urls");

  const entry = await collection.findOne({ alias: alias.toLowerCase() });

  if (!entry) {
    notFound();
  }

  redirect(entry.url);
}
