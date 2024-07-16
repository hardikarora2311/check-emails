"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronsUpDown, Info, Loader2 } from "lucide-react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

const ALLOWED_EMAILS = [10, 15, 20, 25];

const Page = () => {
  const { data: session } = useSession() as { data: Session | null };
  const [numberEmails, setIsNumberEmails] = useState(15);
  const [openaiKey, setOpenaiKey] = useState("");
  const [classifications, setClassifications] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const storedKey = localStorage.getItem("openaiKey");
    if (storedKey) {
      setOpenaiKey(storedKey);
    }
  }, []);

  const {
    data: emails,
    isLoading: isLoadingEmails,
    refetch,
  } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const res = await fetch(`/api/emails?maxResults=${numberEmails}`);
      if (!res.ok) throw new Error("Failed to fetch emails");
      console.log(emails);
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const { mutate: classifyMutation, isPending } = useMutation({
    mutationKey: ["classify"],
    mutationFn: async (emails: any[]) => {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, openaiKey }),
      });
      if (!res.ok) throw new Error("Failed to classify email");
      return res.json();
    },
    onSuccess: (data) => {
      const newClassifications = data.reduce(
        (
          acc: { [key: string]: string },
          item: { id: string; classification: string }
        ) => {
          acc[item.id] = item.classification;
          return acc;
        },
        {}
      );
      setClassifications(newClassifications);
    },
  });

  function returnName(email: string) {
    const nameArray = email.split(" ");
    const name = nameArray[0] + " " + nameArray[1];
    return name;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h4 className="mb-4 font-semibold text-lg">Logging you in...</h4>
        <Loader2 size={40} className="animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div>
      <Navbar
        email={session.user?.email!}
        image={session.user?.image!}
        name={session.user?.name!}
      />
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between mb-10">
          <div className="flex font-semibold mt-8 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center "
                >
                  {numberEmails}
                  <ChevronsUpDown className="size-4 ml-2 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-0">
                {ALLOWED_EMAILS.map((num) => (
                  <DropdownMenuItem
                    key={num.toString()}
                    className={cn(
                      "flex text-sm gap-1 items-center p-2.5 cursor-default hover:bg-zinc-100",
                      {
                        "bg-zinc-100": numberEmails === num,
                      }
                    )}
                    onClick={() => {
                      setIsNumberEmails(num);
                      setTimeout(() => {
                        refetch();
                      }, 1000);
                    }}
                  >
                    {num}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-5 ml-2 shrink-0 opacity-50 text-zinc-950" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Select dropdown to choose how many emails you want to
                    classify.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-6">
            <Button
              onClick={() => classifyMutation(emails)}
              disabled={isPending}
            >
              {isPending ? "Classifying..." : "Classify Emails"}
            </Button>
          </div>
        </div>

        {isLoadingEmails ? (
          <>
            <Skeleton className="w-full h-24 my-5 bg-gray-200" />
            <Skeleton className="w-full h-24 my-5 bg-gray-200" />
            <Skeleton className="w-full h-24 my-5 bg-gray-200" />
            <Skeleton className="w-full h-24 my-5 bg-gray-200" />
            <Skeleton className="w-full h-24 my-5 bg-gray-200" />
          </>
        ) : (
          <>
            <ul>
              {emails?.map((email: any) => (
                <Sheet>
                  <SheetTrigger asChild>
                    <li
                      key={email.id}
                      className="mb-4 p-4 border rounded-lg h-44 bg-white flex justify-between shadow transition hover:shadow-lg cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <h2 className="text-base font-bold text-zinc-800">
                          {returnName(
                            email.payload.headers.find(
                              (h: any) => h.name === "From"
                            )?.value || "Unknown"
                          )}
                        </h2>
                        <h2 className="text-sm font-semibold text-zinc-700 mt-2">
                          {email.payload.headers.find(
                            (h: any) => h.name === "Subject"
                          )?.value || "No subject"}
                        </h2>
                        <p className="w-[95%] text-zinc-600 sm:w-[80%] lg:w-[60%]">
                          {email.snippet}
                        </p>
                      </div>
                      {classifications[email.id] && (
                        <p
                          className={cn(
                            "font-bold ml-auto self-center text-lg",
                            {
                              "text-green-500":
                                classifications[email.id] === "Important",
                              "text-blue-500":
                                classifications[email.id] === "Promotional",
                              "text-yellow-500":
                                classifications[email.id] === "Marketing",
                              "text-pink-500":
                                classifications[email.id] === "Social",
                              "text-red-500":
                                classifications[email.id] === "Spam",
                              "text-gray-500":
                                classifications[email.id] === "General",
                            }
                          )}
                        >
                          {classifications[email.id]}
                        </p>
                      )}
                    </li>
                  </SheetTrigger>
                  <SheetContent className="w-[32rem] md:w-[42rem] sm:max-w-2xl overflow-scroll">
                    <SheetHeader>
                      <SheetTitle className="italic">
                        Email from{" "}
                        {returnName(
                          email.payload.headers.find(
                            (h: any) => h.name === "From"
                          )?.value || "Unknown"
                        )}{" "}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col mt-8">
                      <div className="flex items-end">
                        <h2 className="text-lg font-bold text-zinc-800">
                          {email.payload.headers.find(
                            (h: any) => h.name === "From"
                          )?.value || "Unknown"}
                        </h2>
                        <h3
                          className={cn("font-bold ml-auto text-lg", {
                            "text-green-500":
                              classifications[email.id] === "Important",
                            "text-blue-500":
                              classifications[email.id] === "Promotional",
                            "text-yellow-500":
                              classifications[email.id] === "Marketing",
                            "text-pink-500":
                              classifications[email.id] === "Social",
                            "text-red-500":
                              classifications[email.id] === "Spam",
                            "text-gray-500":
                              classifications[email.id] === "General",
                          })}
                        >
                          {classifications[email.id]}
                        </h3>
                      </div>

                      <h2 className="text-lg font-semibold text-zinc-700 mt-8">
                        Subject:{" "}
                        {email.payload.headers.find(
                          (h: any) => h.name === "Subject"
                        )?.value || "No subject"}
                      </h2>

                      <div
                        className="mt-4"
                        dangerouslySetInnerHTML={{ __html: email.body }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              ))}
            </ul>
          </>
        )}
      </MaxWidthWrapper>
    </div>
  );
};

export default Page;
