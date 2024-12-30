// app/chat/[room]/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
 sender: string;
 message: string;
 timestamp: number;
}

export default function ChatRoom() {
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState("");
 const [username, setUsername] = useState("");
 const [isUsernameSet, setIsUsernameSet] = useState(false);
 const { room } = useParams();
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const lastTimestampRef = useRef(0);

 useEffect(() => {
   const fetchMessages = async () => {
     const response = await fetch(
       `/api/messages?room=${room}&lastTimestamp=${lastTimestampRef.current}`
     );
     const newMessages: Message[] = await response.json();
     if (newMessages.length > 0) {
       setMessages((prevMessages) => [...prevMessages, ...newMessages]);
       lastTimestampRef.current = Math.max(
         ...newMessages.map((msg) => msg.timestamp)
       );
     }
   };

   fetchMessages();
   const intervalId = setInterval(fetchMessages, 1000); // Poll every second

   return () => clearInterval(intervalId);
 }, [room]);

 useEffect(() => {
   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const sendMessage = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!input.trim() || !isUsernameSet) return;

   const response = await fetch("/api/send-message", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ room, message: input, sender: username }),
   });

   if (response.ok) {
     setInput("");
   }
 };

 const setUserName = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!username.trim()) return;

   const response = await fetch("/api/set-username", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ room, username }),
   });

   if (response.ok) {
     setIsUsernameSet(true);
   }
 };

 if (!isUsernameSet) {
   return (
     <Card className="w-full max-w-md mx-auto mt-8">
       <CardHeader>
         <CardTitle>Enter Your Username</CardTitle>
       </CardHeader>
       <CardContent>
         <form onSubmit={setUserName} className="space-y-4">
           <Input
             type="text"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             placeholder="Your username"
             className="w-full"
           />
           <Button type="submit" className="w-full">
             Set Username
           </Button>
         </form>
       </CardContent>
     </Card>
   );
 }

 return (
   <Card className="w-full max-w-2xl mx-auto">
     <CardHeader>
       <CardTitle>Chat Room: {room}</CardTitle>
     </CardHeader>
     <CardContent>
       <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
         {messages.map((msg, index) => (
           <div key={index} className="mb-2">
             <span className="font-bold">{msg.sender}: </span>
             {msg.message}
           </div>
         ))}
         <div ref={messagesEndRef} />
       </div>
       <form onSubmit={sendMessage} className="flex gap-2">
         <Input
           type="text"
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder="Type a message..."
           className="flex-grow"
         />
         <Button type="submit">Send</Button>
       </form>
     </CardContent>
   </Card>
 );
}