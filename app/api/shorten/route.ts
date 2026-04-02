import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, alias } = await req.json();

    // Backend URL validation
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Please enter a valid http or https URL." },
        { status: 400 }
      );
    }

    // Alias validation
    if (!alias || alias.trim() === "") {
      return NextResponse.json(
        { error: "Alias is required." },
        { status: 400 }
      );
    }

    const cleanAlias = alias.trim().toLowerCase();

    // Only allow alphanumeric and hyphens
    if (!/^[a-z0-9-]+$/.test(cleanAlias)) {
      return NextResponse.json(
        { error: "Alias can only contain letters, numbers, and hyphens." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("url-shortener");
    const collection = db.collection("urls");

    // Check if alias already exists
    const existing = await collection.findOne({ alias: cleanAlias });
    if (existing) {
      return NextResponse.json(
        { error: "That alias is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Store in DB
    await collection.insertOne({
      alias: cleanAlias,
      url,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, alias: cleanAlias });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
