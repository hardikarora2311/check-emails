import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

const Navbar = ({
  image,
  name,
  email,
}: {
  image: string;
  name: string;
  email: string;
}) => {
  return (
    <nav className="h-32 flex sticky top-0 inset-x-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between mt-5 ">
          <div className="flex z-40 font-semibold mt-8">
            <Avatar className="relative size-20">
              {image ? (
                <div className="relative aspect-square h-full w-full">
                  <AvatarImage
                    src={image}
                    alt="profile picture"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <AvatarFallback>{name}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col justify-center ml-3">
              <div>{name}</div>
              <div>{email}</div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-6">
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                localStorage.removeItem("openaiKey");
                signOut({ callbackUrl: "/" });
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
export default Navbar;
