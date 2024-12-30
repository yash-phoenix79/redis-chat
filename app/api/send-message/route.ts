// app/api/send-message/route.ts

import { NextResponse } from "next/server";
import { publishMessage, storeMessage } from "@/lib/redis";

export async function POST(req: Request) {
 const { room, message, sender } = await req.json();

 const fullMessage = {
   sender,
   message,
   timestamp: Date.now(),
 };

 await publishMessage(room, fullMessage);
 await storeMessage(room, fullMessage);

 return NextResponse.json({ success: true });
}