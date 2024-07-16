"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession() as { data: Session | null };
  const [openaiKey, setOpenaiKey] = useState("");

  useEffect(() => {
    const storedKey = localStorage.getItem("openaiKey");
    if (storedKey) {
      setOpenaiKey(storedKey);
    }
  }, []);

  const saveOpenaiKey = () => {
    localStorage.setItem("openaiKey", openaiKey);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-4">Welcome to Email Classifier</h1>
        <Button
          className="font-bold py-2 px-4 rounded mt-3 text-md w-56"
          onClick={() => {
            if (!openaiKey) {
              toast({
                title: "OpenAI API Key Required",
                description: "Please enter your OpenAI API key to continue.",
                variant: "destructive",
              });
              return;
            }
            saveOpenaiKey();
            signIn("google", { callbackUrl: "/emails" });
          }}
        >
          Sign in with Google
        </Button>

        <div className="mt-10 w-80">
          <Input
            type="text"
            id="openai"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="border p-3"
          />
        </div>
      </div>
    );
  }

  return router.push("/emails");
}
