// app/api/set-username/route.ts

import { NextResponse } from "next/server";
import { setUsername } from "@/lib/redis";

export async function POST(req: Request) {
 const { room, username } = await req.json();

 // In a real application, you'd want to generate or retrieve a unique user ID
 const userId = Math.random().toString(36).substring(7);

 await setUsername(room, userId, username);

 return NextResponse.json({ success: true, userId });
}